(function () {
  const ACTIVE_RELATIONSHIP_KEY = "connectionCardsActiveRelationshipV1";
  const PENDING_JOIN_KEY = "connectionCardsPendingJoinV1";

  let currentUser = null;
  let activeRelationshipId = null;
  let relationships = {};
  let pendingInvites = {};
  let invitesListener = null;
  let sync = null;

  function emailKey(email) {
    return email.trim().toLowerCase().replace(/\./g, ",");
  }

  function isValidRelationshipId(id) {
    return typeof id === "string" && /^[-A-Za-z0-9_]+$/.test(id) && id.length >= 10;
  }

  function getRelationshipIdFromUrl() {
    const id = new URLSearchParams(location.search).get("relationship");
    return isValidRelationshipId(id) ? id : null;
  }

  function parseRelationshipJoinInput(input) {
    const trimmed = (input || "").trim();
    if (!trimmed) return null;
    try {
      const url = trimmed.includes("://")
        ? new URL(trimmed)
        : new URL(trimmed.startsWith("?") ? trimmed : `?${trimmed}`, location.origin + location.pathname);
      const fromQuery = url.searchParams.get("relationship");
      if (isValidRelationshipId(fromQuery)) return fromQuery;
    } catch (_error) {
      // Fall through to raw ID parsing.
    }
    return isValidRelationshipId(trimmed) ? trimmed : null;
  }

  function clearRelationshipUrlParam() {
    if (new URLSearchParams(location.search).get("relationship")) {
      history.replaceState(null, "", location.pathname);
    }
  }

  function getRelationshipInviteUrl(relId) {
    return `${location.origin}${location.pathname}?relationship=${encodeURIComponent(relId)}`;
  }

  function getPendingJoinRelationshipId() {
    return getRelationshipIdFromUrl() || sessionStorage.getItem(PENDING_JOIN_KEY);
  }

  function storePendingJoin(relId) {
    if (relId) sessionStorage.setItem(PENDING_JOIN_KEY, relId);
  }

  function clearPendingJoin() {
    sessionStorage.removeItem(PENDING_JOIN_KEY);
    clearRelationshipUrlParam();
  }

  function promptSignInToJoin() {
    storePendingJoin(getRelationshipIdFromUrl() || sessionStorage.getItem(PENDING_JOIN_KEY));
    setAuthModalOpen(true);
    sync?.setSyncStatus?.("Sign in to join this relationship");
  }

  function isAccountUser(user) {
    return !!(user && !user.isAnonymous && user.email);
  }

  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text;
  }

  function showAuthError(message) {
    const el = $("authError");
    if (!el) return;
    el.textContent = message || "";
    el.hidden = !message;
  }

  function setAuthTab(tab) {
    const signIn = $("authSignInForm");
    const signUp = $("authSignUpForm");
    const signInTab = $("authTabSignIn");
    const signUpTab = $("authTabSignUp");
    if (!signIn || !signUp) return;
    const isSignIn = tab === "signin";
    signIn.hidden = !isSignIn;
    signUp.hidden = isSignIn;
    signInTab?.classList.toggle("active", isSignIn);
    signUpTab?.classList.toggle("active", !isSignIn);
    showAuthError("");
  }

  function setAuthModalOpen(open) {
    const modal = $("authModal");
    if (!modal) return;
    modal.hidden = !open;
    if (open) {
      setAuthTab("signin");
      $("authSignInEmail")?.focus();
    } else {
      showAuthError("");
    }
  }

  function setRelationshipMenuOpen(open) {
    const menu = $("relationshipMenu");
    const btn = $("relationshipMenuBtn");
    if (!menu || !btn) return;
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) $("relationshipNameInput")?.focus();
  }

  function setAccountMenuOpen(open) {
    const menu = $("accountMenu");
    const btn = $("accountChipBtn");
    if (!menu || !btn) return;
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function setAccountActionStatus(message) {
    setText("accountActionStatus", message || "");
  }

  function shortenEmail(email) {
    if (!email) return "Account";
    const at = email.indexOf("@");
    if (at <= 0) return email;
    const local = email.slice(0, at);
    const domain = email.slice(at);
    if (local.length <= 10) return email;
    return local.slice(0, 9) + "…" + domain;
  }

  function setMode(mode) {
    const isAccount = mode === "account";
    document.querySelectorAll(".guest-only").forEach(el => {
      el.hidden = isAccount;
    });
    document.querySelectorAll(".account-only").forEach(el => {
      el.hidden = !isAccount;
    });
    if (!isAccount) {
      setAccountMenuOpen(false);
    }
  }

  function renderRelationshipList() {
    const list = $("relationshipList");
    if (!list) return;
    list.innerHTML = "";
    const entries = Object.entries(relationships).sort((a, b) =>
      (a[1].name || "").localeCompare(b[1].name || "")
    );
    if (!entries.length) {
      const empty = document.createElement("p");
      empty.className = "menu-hint";
      empty.textContent = "No relationships yet. Create one below.";
      list.appendChild(empty);
      return;
    }
    for (const [id, rel] of entries) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "action menu-item" + (id === activeRelationshipId ? " active" : "");
      btn.textContent = rel.name || "Relationship";
      btn.addEventListener("click", () => {
        switchRelationship(id);
        setRelationshipMenuOpen(false);
      });
      list.appendChild(btn);
    }
  }

  function renderPendingInvites() {
    const section = $("pendingInvitesSection");
    const list = $("pendingInvitesList");
    if (!section || !list) return;
    const entries = Object.entries(pendingInvites);
    section.hidden = !entries.length;
    list.innerHTML = "";
    for (const [relId, invite] of entries) {
      const row = document.createElement("div");
      row.className = "invite-row";
      const label = document.createElement("span");
      label.textContent = invite.name || "Relationship invite";
      const acceptBtn = document.createElement("button");
      acceptBtn.type = "button";
      acceptBtn.className = "action primary";
      acceptBtn.textContent = "Accept";
      acceptBtn.addEventListener("click", () => acceptInvite(relId, invite));
      row.appendChild(label);
      row.appendChild(acceptBtn);
      list.appendChild(row);
    }
  }

  function renderMembers() {
    const list = $("membersList");
    if (!list || !activeRelationshipId) return;
    const rel = relationships[activeRelationshipId];
    list.innerHTML = "";
    if (!rel?.members) {
      list.hidden = true;
      return;
    }
    list.hidden = false;
    for (const member of Object.values(rel.members)) {
      const item = document.createElement("li");
      item.textContent = member.email + (member.role === "owner" ? " (owner)" : "");
      list.appendChild(item);
    }
  }

  function updateAccountUI() {
    if (!isAccountUser(currentUser)) return;
    setText("accountChipLabel", shortenEmail(currentUser.email));
    setText("accountMenuEmail", currentUser.email);
    const rel = activeRelationshipId ? relationships[activeRelationshipId] : null;
    setText("relationshipCode", rel?.name || "…");
    const shareSection = $("shareRelationshipSection");
    const inviteLinkInput = $("inviteLinkDisplay");
    if (shareSection) {
      shareSection.hidden = !activeRelationshipId;
    }
    if (inviteLinkInput) {
      inviteLinkInput.value = activeRelationshipId ? getRelationshipInviteUrl(activeRelationshipId) : "";
    }
    renderRelationshipList();
    renderPendingInvites();
    renderMembers();
  }

  function getStoredActiveRelationship() {
    return localStorage.getItem(ACTIVE_RELATIONSHIP_KEY);
  }

  function storeActiveRelationship(id) {
    if (id) localStorage.setItem(ACTIVE_RELATIONSHIP_KEY, id);
    else localStorage.removeItem(ACTIVE_RELATIONSHIP_KEY);
  }

  async function ensureUserProfile(user) {
    const { db } = window.connectionCardsFirebase;
    const key = emailKey(user.email);
    const userRef = db.ref(`users/${user.uid}`);
    const snap = await userRef.once("value");
    if (!snap.exists()) {
      await userRef.set({
        email: user.email,
        emailKey: key
      });
    } else {
      const data = snap.val();
      if (!data.emailKey || data.email !== user.email) {
        await userRef.update({ email: user.email, emailKey: key });
      }
    }
  }

  async function loadRelationshipMeta(relId) {
    const { db } = window.connectionCardsFirebase;
    const snap = await db.ref(`relationships/${relId}`).once("value");
    if (!snap.exists()) return null;
    const data = snap.val();
    return {
      id: relId,
      name: data.name || "Relationship",
      members: data.members || {}
    };
  }

  async function loadUserRelationships(uid) {
    const { db } = window.connectionCardsFirebase;
    const indexSnap = await db.ref(`users/${uid}/relationships`).once("value");
    const index = indexSnap.val() || {};
    relationships = {};
    await Promise.all(
      Object.keys(index).map(async relId => {
        const meta = await loadRelationshipMeta(relId);
        if (meta) relationships[relId] = meta;
      })
    );
  }

  function detachInvitesListener() {
    if (invitesListener) {
      invitesListener.off();
      invitesListener = null;
    }
  }

  function listenPendingInvites(user) {
    detachInvitesListener();
    const { db } = window.connectionCardsFirebase;
    const key = emailKey(user.email);
    invitesListener = db.ref(`invitesByEmail/${key}`);
    invitesListener.on("value", snap => {
      pendingInvites = snap.val() || {};
      renderPendingInvites();
    });
  }

  function pickDefaultRelationship() {
    const stored = getStoredActiveRelationship();
    if (stored && relationships[stored]) return stored;
    const ids = Object.keys(relationships);
    return ids.length ? ids[0] : null;
  }

  async function connectToRelationship(relId) {
    const rel = relationships[relId];
    if (!rel || !sync) return;
    const fresh = await loadRelationshipMeta(relId);
    if (fresh) relationships[relId] = fresh;
    activeRelationshipId = relId;
    storeActiveRelationship(relId);
    sync.connectRelationship(relId, relationships[relId].name);
    updateAccountUI();
  }

  async function switchRelationship(relId) {
    if (!relationships[relId]) return;
    const { db } = window.connectionCardsFirebase;
    activeRelationshipId = relId;
    storeActiveRelationship(relId);
    await db.ref(`users/${currentUser.uid}/activeRelationshipId`).set(relId);
    connectToRelationship(relId);
  }

  async function createRelationship(name) {
    if (!isAccountUser(currentUser)) return;
    const trimmed = (name || "").trim() || "My Relationship";
    const { db } = window.connectionCardsFirebase;
    const ref = db.ref("relationships").push();
    const id = ref.key;
    const now = Date.now();
    await ref.set({
      name: trimmed,
      createdBy: currentUser.uid,
      createdAt: now,
      members: {
        [currentUser.uid]: {
          email: currentUser.email,
          role: "owner",
          joinedAt: now
        }
      }
    });
    await db.ref(`users/${currentUser.uid}`).update({
      [`relationships/${id}`]: true,
      activeRelationshipId: id
    });
    relationships[id] = {
      id,
      name: trimmed,
      members: {
        [currentUser.uid]: {
          email: currentUser.email,
          role: "owner",
          joinedAt: now
        }
      }
    };
    connectToRelationship(id);
    setRelationshipMenuOpen(false);
  }

  async function inviteToRelationship(email) {
    if (!isAccountUser(currentUser) || !activeRelationshipId) return;
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes("@")) {
      window.alert("Enter a valid email address.");
      return;
    }
    if (normalized === currentUser.email.toLowerCase()) {
      window.alert("You are already in this relationship.");
      return;
    }
    const rel = relationships[activeRelationshipId];
    const key = emailKey(normalized);
    const { db } = window.connectionCardsFirebase;
    const now = Date.now();
    await db.ref(`relationships/${activeRelationshipId}/invites/${key}`).set({
      email: normalized,
      invitedAt: now,
      invitedBy: currentUser.uid
    });
    await db.ref(`invitesByEmail/${key}/${activeRelationshipId}`).set({
      relationshipId: activeRelationshipId,
      name: rel?.name || "Relationship",
      invitedBy: currentUser.uid,
      invitedAt: now
    });
    $("inviteEmailInput").value = "";
    setText("inviteStatus", "Invite sent to " + normalized);
    setTimeout(() => setText("inviteStatus", ""), 3000);
  }

  async function addMemberToRelationship(relId) {
    const { db } = window.connectionCardsFirebase;
    const key = emailKey(currentUser.email);
    const now = Date.now();
    await db.ref(`relationships/${relId}/members/${currentUser.uid}`).set({
      email: currentUser.email,
      role: "member",
      joinedAt: now
    });
    await db.ref(`users/${currentUser.uid}`).update({
      [`relationships/${relId}`]: true,
      activeRelationshipId: relId
    });
    await db.ref(`invitesByEmail/${key}/${relId}`).remove();
    await db.ref(`relationships/${relId}/invites/${key}`).remove();
    const meta = await loadRelationshipMeta(relId);
    if (!meta) return null;
    relationships[relId] = meta;
    delete pendingInvites[relId];
    return meta;
  }

  async function acceptInvite(relId, invite) {
    if (!isAccountUser(currentUser)) return;
    const meta = await addMemberToRelationship(relId);
    if (meta) {
      connectToRelationship(relId);
      renderPendingInvites();
      setRelationshipMenuOpen(false);
    }
  }

  async function joinRelationship(relId) {
    if (!isValidRelationshipId(relId)) {
      window.alert("Enter a valid invite link or relationship ID.");
      return false;
    }
    if (!isAccountUser(currentUser)) {
      storePendingJoin(relId);
      promptSignInToJoin();
      return false;
    }
    if (relationships[relId]) {
      connectToRelationship(relId);
      clearPendingJoin();
      setRelationshipMenuOpen(false);
      return true;
    }
    try {
      const meta = await addMemberToRelationship(relId);
      if (!meta) {
        window.alert("Could not find that relationship. Check the invite link and try again.");
        return false;
      }
      connectToRelationship(relId);
      renderPendingInvites();
      clearPendingJoin();
      setRelationshipMenuOpen(false);
      setText("joinRelationshipStatus", "Joined " + (meta.name || "relationship"));
      setTimeout(() => setText("joinRelationshipStatus", ""), 3000);
      return true;
    } catch (error) {
      console.error(error);
      window.alert("Could not join this relationship. The invite link may be invalid.");
      return false;
    }
  }

  async function copyRelationshipInviteLink() {
    if (!activeRelationshipId) {
      window.alert("Create a relationship first to get an invite link.");
      return;
    }
    const url = getRelationshipInviteUrl(activeRelationshipId);
    const inviteLinkInput = $("inviteLinkDisplay");
    if (inviteLinkInput) {
      inviteLinkInput.value = url;
      inviteLinkInput.focus();
      inviteLinkInput.select();
    }
    try {
      await navigator.clipboard.writeText(url);
      setText("inviteStatus", "Link copied");
      sync?.setSyncStatus?.("Invite link copied");
      setTimeout(() => {
        if (sync?.setSyncStatus) sync.setSyncStatus("Synced");
      }, 2000);
    } catch (_error) {
      window.prompt("Copy this link to invite your partner:", url);
      setText("inviteStatus", "Copy the link above");
    }
    setTimeout(() => setText("inviteStatus", ""), 3000);
  }

  async function handlePendingRelationshipJoin() {
    const relId = getPendingJoinRelationshipId();
    if (!relId) return false;
    if (!isAccountUser(currentUser)) {
      promptSignInToJoin();
      return false;
    }
    return joinRelationship(relId);
  }

  async function signUp(email, password) {
    const { auth } = window.connectionCardsFirebase;
    showAuthError("");
    try {
      await auth.createUserWithEmailAndPassword(email.trim(), password);
      setAuthModalOpen(false);
    } catch (error) {
      showAuthError(error.message || "Could not create account.");
    }
  }

  async function signIn(email, password) {
    const { auth } = window.connectionCardsFirebase;
    showAuthError("");
    try {
      await auth.signInWithEmailAndPassword(email.trim(), password);
      setAuthModalOpen(false);
    } catch (error) {
      showAuthError(error.message || "Could not sign in.");
    }
  }

  async function signOut() {
    const { auth } = window.connectionCardsFirebase;
    setAccountMenuOpen(false);
    await auth.signOut();
  }

  async function resetPassword() {
    if (!isAccountUser(currentUser)) return;
    const { auth } = window.connectionCardsFirebase;
    setAccountActionStatus("");
    try {
      await auth.sendPasswordResetEmail(currentUser.email);
      setAccountActionStatus("Password reset email sent to " + currentUser.email);
    } catch (error) {
      console.error(error);
      setAccountActionStatus(error.message || "Could not send password reset email.");
    }
  }

  async function deleteAccount() {
    if (!isAccountUser(currentUser)) return;
    const confirmed = window.confirm(
      "Delete your account permanently? You will be removed from all relationships and lose access to synced cards. This cannot be undone."
    );
    if (!confirmed) return;

    const { auth, db } = window.connectionCardsFirebase;
    const uid = currentUser.uid;
    const key = emailKey(currentUser.email);
    setAccountActionStatus("");

    try {
      const relIndexSnap = await db.ref(`users/${uid}/relationships`).once("value");
      const relIds = Object.keys(relIndexSnap.val() || {});
      await Promise.all(relIds.map(relId =>
        db.ref(`relationships/${relId}/members/${uid}`).remove()
      ));
      await db.ref(`invitesByEmail/${key}`).remove();
      await db.ref(`users/${uid}`).remove();
      setAccountMenuOpen(false);
      await auth.currentUser.delete();
    } catch (error) {
      console.error(error);
      if (error.code === "auth/requires-recent-login") {
        setAccountActionStatus("Sign out, sign in again, then retry delete.");
      } else {
        setAccountActionStatus(error.message || "Could not delete account.");
      }
    }
  }

  async function enterAccountMode(user) {
    setMode("account");
    await ensureUserProfile(user);
    await loadUserRelationships(user.uid);
    listenPendingInvites(user);
    if (await handlePendingRelationshipJoin()) {
      updateAccountUI();
      return;
    }
    const relId = pickDefaultRelationship();
    if (relId) {
      connectToRelationship(relId);
    } else if (Object.keys(pendingInvites).length) {
      sync?.setSyncStatus?.("Accept an invite to get started");
    } else {
      sync?.setSyncStatus?.("Create a relationship to sync cards");
    }
    updateAccountUI();
  }

  async function enterGuestMode() {
    setMode("guest");
    activeRelationshipId = null;
    detachInvitesListener();
    pendingInvites = {};
    relationships = {};
    if (sync?.connectGuest) {
      sync.connectGuest();
    }
  }

  async function handleAuthState(user) {
    currentUser = user;
    const { auth } = window.connectionCardsFirebase;

    if (isAccountUser(user)) {
      await enterAccountMode(user);
      return;
    }

    if (!user) {
      try {
        await auth.signInAnonymously();
      } catch (error) {
        sync?.setSyncStatus?.("Could not connect", true);
        console.error(error);
      }
      return;
    }

    if (user.isAnonymous) {
      const pendingJoinId = getRelationshipIdFromUrl();
      if (pendingJoinId) {
        storePendingJoin(pendingJoinId);
        promptSignInToJoin();
      }
      await enterGuestMode();
    }
  }

  function wireUI() {
    $("signInBtn")?.addEventListener("click", () => setAuthModalOpen(true));
    $("authModalClose")?.addEventListener("click", () => setAuthModalOpen(false));
    $("authModalBackdrop")?.addEventListener("click", () => setAuthModalOpen(false));

    $("authTabSignIn")?.addEventListener("click", () => setAuthTab("signin"));
    $("authTabSignUp")?.addEventListener("click", () => setAuthTab("signup"));

    $("authSignInSubmit")?.addEventListener("click", () => {
      signIn($("authSignInEmail")?.value, $("authSignInPassword")?.value);
    });
    $("authSignUpSubmit")?.addEventListener("click", () => {
      signUp($("authSignUpEmail")?.value, $("authSignUpPassword")?.value);
    });

    $("signOutBtn")?.addEventListener("click", () => {
      signOut();
    });

    $("relationshipMenuBtn")?.addEventListener("click", event => {
      event.stopPropagation();
      setRelationshipMenuOpen($("relationshipMenu")?.hidden);
    });

    $("accountChipBtn")?.addEventListener("click", event => {
      event.stopPropagation();
      setAccountMenuOpen($("accountMenu")?.hidden);
    });

    $("resetPasswordBtn")?.addEventListener("click", event => {
      event.stopPropagation();
      resetPassword();
    });

    $("deleteAccountBtn")?.addEventListener("click", event => {
      event.stopPropagation();
      deleteAccount();
    });

    $("createRelationshipBtn")?.addEventListener("click", event => {
      event.stopPropagation();
      createRelationship($("relationshipNameInput")?.value);
    });

    $("sendInviteBtn")?.addEventListener("click", event => {
      event.stopPropagation();
      inviteToRelationship($("inviteEmailInput")?.value);
    });

    $("copyInviteLinkBtn")?.addEventListener("click", event => {
      event.stopPropagation();
      copyRelationshipInviteLink();
    });

    $("joinRelationshipBtn")?.addEventListener("click", event => {
      event.stopPropagation();
      const relId = parseRelationshipJoinInput($("relationshipJoinInput")?.value);
      joinRelationship(relId);
    });

    document.addEventListener("click", event => {
      if (!$("relationshipMenu")?.hidden && !event.target.closest(".relationship-dropdown")) {
        setRelationshipMenuOpen(false);
      }
      if (!$("accountMenu")?.hidden && !event.target.closest(".account-chip-dropdown")) {
        setAccountMenuOpen(false);
      }
    });

    $("relationshipMenu")?.addEventListener("click", e => e.stopPropagation());
    $("accountMenu")?.addEventListener("click", e => e.stopPropagation());

    $("relationshipNameInput")?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        createRelationship($("relationshipNameInput")?.value);
      }
    });

    $("inviteEmailInput")?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        inviteToRelationship($("inviteEmailInput")?.value);
      }
    });

    $("relationshipJoinInput")?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        const relId = parseRelationshipJoinInput($("relationshipJoinInput")?.value);
        joinRelationship(relId);
      }
    });
  }

  window.ConnectionCardsAccount = {
    init(handlers) {
      sync = handlers;
      wireUI();
      setMode("guest");
      window.connectionCardsFirebase.auth.onAuthStateChanged(handleAuthState);
    },
    isLoggedIn() {
      return isAccountUser(currentUser);
    },
    getActiveRelationshipId() {
      return activeRelationshipId;
    }
  };
})();
