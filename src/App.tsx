/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { initVanishEngine } from './engine/vanishEngine';

const STORY_REACT_EMOJIS = ['❤️', '🔥', '😂', '😮', '😢', '👏'];

export default function App() {
  useEffect(() => {
    initVanishEngine();
  }, []);

  return (
    <>
      {/* ====================================================================
          BOOT SCREEN
          ==================================================================== */}
      <div id="bootScreen" className="screen active" aria-live="polite">
        <div className="boot-mark" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.4 4.6-1.25 8-6.15 8-11.4V6l-8-4z" />
            <path d="M9.5 12.2l1.8 1.8 3.6-3.8" />
          </svg>
        </div>
        <div className="boot-name">Vanish Chats</div>
        <div className="boot-sub">Private ephemeral messaging</div>
        <div className="boot-spin" aria-hidden="true" />
      </div>

      {/* ====================================================================
          AUTHENTICATION SCREEN (LOGIN & SIGNUP)
          ==================================================================== */}
      <section id="authScreen" className="screen" aria-label="Authentication">
        <div className="auth-ambient" aria-hidden="true">
          <div className="auth-orb o1" />
          <div className="auth-orb o2" />
          <div className="auth-orb o3" />
          <div className="auth-particles" />
        </div>

        <div className="auth-shell">
          {/* Desktop Brand & Live Dissolving Showcase */}
          <div className="auth-showcase">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white shadow-lg">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.4 4.6-1.25 8-6.15 8-11.4V6l-8-4z" />
                    <path d="M9.5 12.2l1.8 1.8 3.6-3.8" />
                  </svg>
                </div>
                <span className="font-bold text-base tracking-tight">Vanish Chats</span>
              </div>

              <h1>
                Conversations built to <em>leave zero trace.</em>
              </h1>

              <div className="demo" aria-hidden="true">
                <div id="demoB" className="demo-b">
                  <span id="demoTx">Every message vanishes on your timer.</span>
                  <span className="demo-meta">
                    <svg className="ring" viewBox="0 0 16 16">
                      <circle className="tr" cx="8" cy="8" r="6" />
                      <circle id="demoPr" className="pr" cx="8" cy="8" r="6" />
                    </svg>
                    <span id="demoTm">6s</span>
                  </span>
                </div>
                <div className="demo-cap">
                  Live preview · Messages dissolve automatically for both participants
                </div>
              </div>
            </div>

            <ul className="feats">
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                <span>
                  <b>Self-destructing messages</b> — choose custom timers from 20 seconds up to 24 hours.
                </span>
              </li>
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
                  <circle cx="12" cy="12" r="2.6" />
                </svg>
                <span>
                  <b>View-once media &amp; stories</b> — share photos, videos, voice notes, and 12-hour status updates.
                </span>
              </li>
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                <span>
                  <b>Active privacy shield</b> — automatic blur protection when switching tabs or windows.
                </span>
              </li>
            </ul>
          </div>

          {/* Floating Translucent Authentication Card */}
          <div className="auth-card">
            <div className="auth-brand">
              <div className="auth-logo" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.4 4.6-1.25 8-6.15 8-11.4V6l-8-4z" />
                  <path d="M9.5 12.2l1.8 1.8 3.6-3.8" />
                </svg>
              </div>
              <h2 id="authHeading">Welcome back</h2>
              <p id="authSubtitle">Sign in to continue your private conversations</p>
            </div>

            <div className="tabs" role="tablist" aria-label="Authentication mode">
              <div id="tabInd" className="tabind" aria-hidden="true" />
              <button type="button" className="tab active" data-tab="login">
                Sign In
              </button>
              <button type="button" className="tab" data-tab="signup">
                Create Account
              </button>
            </div>

            {/* Sign In Form */}
            <form id="loginForm" autoComplete="on" noValidate>
              <div className="field">
                <label htmlFor="liEmail">Email address</label>
                <div className="input-wrap">
                  <input
                    id="liEmail"
                    type="email"
                    className="glass-input"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="liPass">Password</label>
                <div className="input-wrap">
                  <input
                    id="liPass"
                    type="password"
                    className="glass-input has-toggle"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    data-target="liPass"
                    aria-label="Show password"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="auth-row-end">
                <button type="button" id="forgotBtn" className="forgot-link">
                  Forgot password?
                </button>
              </div>

              <button type="submit" id="loginSubmitBtn" className="btn primary">
                <span>Sign In</span>
              </button>
            </form>

            {/* Create Account Form */}
            <form id="signupForm" autoComplete="on" hidden noValidate>
              <div className="field">
                <label htmlFor="suName">Display name</label>
                <div className="input-wrap">
                  <input
                    id="suName"
                    type="text"
                    className="glass-input"
                    placeholder="Alex Rivera"
                    autoComplete="name"
                    maxLength={40}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="suEmail">Email address</label>
                <div className="input-wrap">
                  <input
                    id="suEmail"
                    type="email"
                    className="glass-input"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="suPass">Password</label>
                <div className="input-wrap">
                  <input
                    id="suPass"
                    type="password"
                    className="glass-input has-toggle"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    data-target="suPass"
                    aria-label="Show password"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="field">
                <label htmlFor="suPassConfirm">Confirm password</label>
                <div className="input-wrap">
                  <input
                    id="suPassConfirm"
                    type="password"
                    className="glass-input has-toggle"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    data-target="suPassConfirm"
                    aria-label="Show password"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" id="signupSubmitBtn" className="btn primary">
                <span>Create Account</span>
              </button>
            </form>

            <div className="divider">or continue with</div>

            <button type="button" id="googleBtn" className="btn google">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.4c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.04-4.38 3.04-7.51 0-.72-.06-1.42-.19-2H12z"
                />
                <path
                  fill="#34A853"
                  d="M12 22c2.75 0 5.06-.91 6.74-2.46l-3.3-2.56c-.91.61-2.08.98-3.44.98-2.64 0-4.88-1.78-5.68-4.18H2.91v2.63A10 10 0 0 0 12 22z"
                />
                <path
                  fill="#4A90E2"
                  d="M6.32 13.78A5.98 5.98 0 0 1 6 12c0-.62.11-1.22.32-1.78V7.59H2.91A10 10 0 0 0 2 12c0 1.61.39 3.14 1.08 4.41l3.24-2.63z"
                />
                <path
                  fill="#FBBC05"
                  d="M12 6.04c1.5 0 2.84.52 3.9 1.53l2.92-2.92C17.05 2.99 14.75 2 12 2A10 10 0 0 0 2.91 7.59l3.41 2.63C7.12 7.82 9.36 6.04 12 6.04z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div id="authErr" className="auth-msg err" role="alert" hidden />

            <p className="fineprint">
              Messages dissolve automatically after your active timer expires. By continuing, you agree to respectful, private communication.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          MAIN APPLICATION WORKSPACE
          ==================================================================== */}
      <main id="appScreen" className="screen" aria-label="Messaging workspace">
        <div className="app-ambient" aria-hidden="true">
          <div className="app-orb a1" />
          <div className="app-orb a2" />
          <div className="app-orb a3" />
        </div>
        <div className="workspace">
          {/* Desktop Floating Glass Navigation Rail */}
          <nav id="navRail" className="nav-rail" aria-label="Primary navigation">
            <div className="rail-logo" title="Vanish Chats">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.4 4.6-1.25 8-6.15 8-11.4V6l-8-4z" />
                <path d="M9.5 12.2l1.8 1.8 3.6-3.8" />
              </svg>
            </div>

            <button
              type="button"
              className="rail-btn rail-nav-btn on"
              data-tab="chats"
              title="Conversations"
              aria-label="Conversations"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.39-4.12-1.07L3 21l1.62-5.1A8.46 8.46 0 0 1 3.5 12 8.5 8.5 0 0 1 12 3.5 8.5 8.5 0 0 1 21 12z" />
              </svg>
            </button>

            <button
              type="button"
              className="rail-btn rail-nav-btn"
              data-tab="explore"
              title="Directory"
              aria-label="Directory"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </button>

            <button
              type="button"
              className="rail-btn rail-nav-btn"
              data-tab="updates"
              title="Stories & Updates"
              aria-label="Stories"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" strokeDasharray="4 2.5" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </button>

            <div className="rail-spacer" />

            <button
              type="button"
              id="railThemeBtn"
              className="rail-btn"
              title="Toggle Dark / Light mode"
              aria-label="Toggle theme"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>

            <button
              type="button"
              className="rail-btn rail-nav-btn"
              data-tab="settings"
              title="Settings & Customization"
              aria-label="Settings"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.02 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            <div
              id="railMeAvatar"
              className="avatar sm clickable mt-1"
              title="My profile"
              role="button"
              tabIndex={0}
            />
          </nav>

          {/* Conversation List & Stories Sidebar */}
          <aside className="sidebar" aria-label="Conversations">
            <header className="sbrand">
              <div
                id="meAvatar"
                className="avatar sm clickable"
                title="My profile"
                role="button"
                tabIndex={0}
              />
              <h2 id="headTitle">Vanish Chats</h2>
              <span id="chatCnt" hidden>
                0
              </span>
              <div className="spacer" />
              <button
                type="button"
                id="arCamBtn"
                className="iconbtn"
                title="Quick camera capture"
                aria-label="Camera"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              <input
                id="arCamFile"
                type="file"
                accept="image/*,video/*"
                capture="environment"
                hidden
              />
              <button
                type="button"
                id="menuBtn"
                className="iconbtn"
                title="Menu & Settings"
                aria-label="More options"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.9" />
                  <circle cx="12" cy="12" r="1.9" />
                  <circle cx="12" cy="19" r="1.9" />
                </svg>
              </button>
            </header>

            <div className="search">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7.5" />
                <path d="M20.5 20.5l-4.2-4.2" />
              </svg>
              <input
                id="searchInput"
                type="search"
                placeholder="Search people or chats…"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div className="arPills" role="tablist" aria-label="Filter conversations">
              <button type="button" className="on" data-f="all">
                All
              </button>
              <button type="button" data-f="online">
                Online
              </button>
              <button type="button" data-f="unread">
                Unread
              </button>
            </div>

            {/* Notification Permission Banner */}
            <div id="notifyBanner" hidden>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <div className="ntx">
                <b>Enable instant alerts</b>
                <span>Catch disappearing messages before they dissolve</span>
              </div>
              <button type="button" id="notifyAllow">
                Allow
              </button>
              <button
                type="button"
                id="notifySkip"
                className="iconbtn"
                title="Dismiss"
                aria-label="Dismiss notification prompt"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stories / Ephemeral Updates Strip */}
            <div id="sbar" className="sbar" aria-label="Stories" />

            {/* Empty State & Conversation List */}
            <div id="sideNote" className="snote" hidden />
            <div id="userList" className="ulist" />

            {/* New Chat / Directory FAB */}
            <button
              type="button"
              id="fab"
              className="fab"
              title="Start new conversation"
              aria-label="Start new conversation"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>

            {/* Mobile Floating Glass Bottom Navigation */}
            <nav id="tabbar" className="tabbar" aria-label="Mobile navigation">
              <button type="button" className="tbtn on" data-tab="chats">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.39-4.12-1.07L3 21l1.62-5.1A8.46 8.46 0 0 1 3.5 12 8.5 8.5 0 0 1 12 3.5 8.5 8.5 0 0 1 21 12z" />
                </svg>
                <span>Chats</span>
              </button>
              <button type="button" className="tbtn" data-tab="explore">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span>Contacts</span>
              </button>
              <button type="button" className="tbtn" data-tab="updates">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" strokeDasharray="4 2.5" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <span>Updates</span>
              </button>
              <button type="button" className="tbtn" data-tab="you">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c1.8-3.6 5-5.5 8-5.5s6.2 1.9 8 5.5" />
                </svg>
                <span>Profile</span>
              </button>
            </nav>
          </aside>

          {/* Central Immersive Chat Arena */}
          <section className="chat" aria-label="Conversation">
            {/* Desktop Empty Chat Placeholder */}
            <div id="chatEmpty">
              <div className="eglass">
                <div className="eglass-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.39-4.12-1.07L3 21l1.62-5.1A8.46 8.46 0 0 1 3.5 12 8.5 8.5 0 0 1 12 3.5 8.5 8.5 0 0 1 21 12z" />
                    <path d="M9 12h.01M12 12h.01M15 12h.01" />
                  </svg>
                </div>
                <h3>Select a conversation</h3>
                <p>
                  Choose someone from your chats or explore the directory to start an ephemeral conversation that dissolves automatically.
                </p>
              </div>
            </div>

            {/* Active Live Chat View */}
            <div id="chatLive" hidden>
              <header className="chat-head">
                <button
                  type="button"
                  id="backBtn"
                  className="iconbtn back"
                  title="Back to chats"
                  aria-label="Back to chats"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>

                <div
                  id="chAvatar"
                  className="avatar sm clickable"
                  title="View contact profile"
                  role="button"
                  tabIndex={0}
                />

                <div id="chMetaClick" className="chmeta" title="View contact profile">
                  <b id="chName">Contact</b>
                  <span id="chState" className="mono">
                    offline
                  </span>
                </div>

                <div className="spacer" />

                <button
                  type="button"
                  id="vdBadge"
                  className="vd-badge"
                  title="Auto-delete timer (tap to customize)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  <span id="vdTxt">40s</span>
                </button>

                <button
                  type="button"
                  id="chatProfileShortcut"
                  className="iconbtn"
                  title="Contact info"
                  aria-label="Contact info"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9.5" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </button>

                <button
                  type="button"
                  id="chatMenuBtn"
                  className="iconbtn"
                  title="Conversation options"
                  aria-label="Conversation options"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.9" />
                    <circle cx="12" cy="12" r="1.9" />
                    <circle cx="12" cy="19" r="1.9" />
                  </svg>
                </button>
              </header>

              {/* Floating Voice Upload Indicator */}
              <div id="upFab" hidden>
                <i aria-hidden="true" />
                <span id="upTxt">Sending voice…</span>
              </div>

              {/* Blocked / Unavailable Banner */}
              <div id="gateBanner" hidden>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M5.7 5.7l12.6 12.6" />
                </svg>
                <span id="gateTxt">Conversation unavailable</span>
              </div>

              {/* Message Stream */}
              <div id="msgs" className="msgs">
                <div id="noneMsg" className="none-msg">
                  Messages in this chat dissolve automatically once their timer runs out. Say hello!
                </div>
              </div>

              {/* Scroll-to-Bottom Button */}
              <button
                type="button"
                id="scFab"
                title="Jump to latest message"
                aria-label="Scroll to latest message"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </button>

              {/* Unified Emoji, Animated Stickers & GIF Picker */}
              <div id="pickPanel" hidden>
                <div className="pp-tabs" role="tablist">
                  <button type="button" className="ppt active" data-pt="emoji">
                    Emoji
                  </button>
                  <button type="button" className="ppt" data-pt="stickers">
                    Stickers
                  </button>
                  <button type="button" className="ppt" data-pt="gifs">
                    GIFs
                  </button>
                </div>

                <div id="ppEmj">
                  <div className="ep">
                    <div id="epCats" className="ep-cats" />
                    <div id="epTone" className="ep-tone" />
                    <div id="epGrid" className="ep-grid" />
                  </div>
                </div>

                <div id="ppStk" hidden>
                  <div className="pp-page">
                    <div id="stkGrid" className="pp-grid stks" />
                  </div>
                </div>

                <div id="ppGif" hidden>
                  <div className="pp-page">
                    <input
                      id="gifSearch"
                      type="search"
                      placeholder="Search reaction GIFs (hug, wave, laugh…)"
                      autoComplete="off"
                    />
                    <div id="gifChips" className="gif-chips" />
                    <div id="gifStatus">Loading GIFs…</div>
                    <div id="gifGrid" />
                  </div>
                </div>
              </div>

              {/* Active Voice Recording Bar */}
              <div id="recBar" hidden>
                <span id="recDot" aria-hidden="true" />
                <span id="recTime">0:00</span>
                <div id="recWave" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <button
                  type="button"
                  id="recCancel"
                  title="Cancel recording"
                  aria-label="Cancel voice recording"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
                <button
                  type="button"
                  id="recSend"
                  title="Send voice note"
                  aria-label="Send voice note"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>

              {/* Reply Preview Bar */}
              <div id="replyBar" hidden>
                <div className="rbb">
                  <b id="rbName">Replying</b>
                  <span id="rbText" />
                </div>
                <button
                  type="button"
                  id="rbCancel"
                  className="iconbtn"
                  title="Cancel reply"
                  aria-label="Cancel reply"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Floating Liquid Glass Message Composer */}
              <form id="composer" className="composer" autoComplete="off">
                <button
                  type="button"
                  id="pickBtn"
                  className="tgPlus"
                  title="Attach photo, video, sticker or GIF"
                  aria-label="Attach media"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>

                <div className="composer-inner">
                  <div
                    id="msgInput"
                    role="textbox"
                    aria-multiline="true"
                    aria-label="Message"
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Message…"
                  />
                  <button
                    type="button"
                    id="emojiBtn"
                    className="composer-tool"
                    title="Emoji & Stickers"
                    aria-label="Emoji picker"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9.5" />
                      <path d="M8.2 14.2s1.5 2.1 3.8 2.1 3.8-2.1 3.8-2.1" />
                      <path d="M9 9.5h.01M15 9.5h.01" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    id="gifTriggerBtn"
                    className="composer-tool"
                    title="GIF library"
                    aria-label="GIF picker"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2.5" y="5" width="19" height="14" rx="3.5" />
                      <path d="M8.5 10H7a1.5 1.5 0 0 0-1.5 1.5v1A1.5 1.5 0 0 0 7 14h1.5v-1.8H7.6" />
                      <path d="M12 10v4" />
                      <path d="M15 14v-4h3M15 12h2.2" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    id="composerCamBtn"
                    className="composer-tool"
                    title="Share photo or video"
                    aria-label="Share photo or video"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                </div>

                <button
                  type="button"
                  id="micBtn"
                  className="micbtn"
                  title="Record voice message"
                  aria-label="Record voice message"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="2.5" width="6" height="11" rx="3" />
                    <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
                    <path d="M12 17.5v3.5M9 21h6" />
                  </svg>
                </button>

                <button
                  type="submit"
                  id="sendBtn"
                  className="sendbtn"
                  title="Send message"
                  aria-label="Send message"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </form>
            </div>
          </section>

          {/* WhatsApp Web-Style Transparent Glass Contact Info Drawer */}
          <aside id="chatInfoDrawer" hidden aria-label="Contact info">
            <header className="cid-head">
              <button
                type="button"
                id="cidClose"
                className="iconbtn"
                title="Close contact info"
                aria-label="Close contact info"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              <h3>Contact Info</h3>
              <button
                type="button"
                id="cidOpenFullBtn"
                className="iconbtn"
                title="Open full identity card"
                aria-label="Open full identity card"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
            </header>

            <div className="cid-body">
              <div className="cid-hero">
                <div className="pavring">
                  <div id="cidAvatar" className="pav">
                    <span id="cidDot" className="dot" />
                  </div>
                </div>
                <div id="cidName" className="pname">
                  Contact
                </div>
                <div className="phandle-row">
                  <div id="cidState" className="pbadge" />
                  <span>·</span>
                  <button
                    type="button"
                    id="cidHandleCopy"
                    className="copy-id-btn"
                    title="Copy handle"
                  >
                    <span>@user</span>
                  </button>
                </div>
                <div id="cidQuickDock" className="pquick-dock" />
              </div>

              <div className="prow">
                <div className="plabel">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="9.5" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <span>About</span>
                </div>
                <div id="cidBio" className="pval">
                  I am using Vanish Chats
                </div>
                <div id="cidJoined" className="psub">
                  Joined —
                </div>
              </div>

              <div className="prow">
                <div className="plabel">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  <span>Disappearing Messages</span>
                </div>
                <div id="cidTtlVal" className="pval">
                  Messages auto-dissolve after 40s
                </div>
              </div>

              <div className="pmedia-sec">
                <div className="pmedia-head">
                  <span>Media, links &amp; GIFs</span>
                  <b id="cidMediaCount">0 active</b>
                </div>
                <div id="cidMediaGrid" className="pmedia-grid" />
              </div>

              <div id="cidActions" className="pacts" />
            </div>
          </aside>
        </div>
      </main>

      {/* ====================================================================
          HIDDEN MEDIA FILE INPUTS
          ==================================================================== */}
      <input id="fileIn" type="file" accept="image/*,image/gif,video/*" hidden />
      <input id="stFileIn" type="file" accept="image/*,video/*" hidden />

      {/* ====================================================================
          FLOATING MENUS, REACTION BAR & ATTACHMENT SHEET
          ==================================================================== */}
      <div id="ctxMenu" role="menu" hidden />
      <div id="reactBar" role="toolbar" aria-label="Message reactions" />

      <div id="attSheet" hidden>
        <div className="attp">
          <div className="atth" aria-hidden="true" />
          <div className="attt">Share in Conversation</div>
          <div className="attg">
            <button type="button" id="attGallery">
              <span className="att-ic">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <circle cx="8.5" cy="9.5" r="1.6" />
                  <path d="M21 15l-5-5-9 9" />
                </svg>
              </span>
              <span>Photo &amp; Video</span>
            </button>

            <button type="button" id="attCamera">
              <span className="att-ic">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>
              <span>Camera</span>
            </button>

            <button type="button" id="attStatus">
              <span className="att-ic">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" strokeDasharray="4 2.5" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              </span>
              <span>My Status</span>
            </button>

            <button type="button" id="attVoice">
              <span className="att-ic">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="2.5" width="6" height="11" rx="3" />
                  <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
                  <path d="M12 17.5v3.5M9 21h6" />
                </svg>
              </span>
              <span>Voice Note</span>
            </button>

            <button type="button" id="attSticker">
              <span className="att-ic">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2z" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <path d="M9 9h.01M15 9h.01" />
                </svg>
              </span>
              <span>Stickers</span>
            </button>

            <button type="button" id="attGif">
              <span className="att-ic">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2.5" y="5" width="19" height="14" rx="3.5" />
                  <path d="M8.5 10H7a1.5 1.5 0 0 0-1.5 1.5v1A1.5 1.5 0 0 0 7 14h1.5v-1.8H7.6" />
                  <path d="M12 10v4" />
                  <path d="M15 14v-4h3M15 12h2.2" />
                </svg>
              </span>
              <span>Animated GIF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================
          WHATSAPP-STYLE MEDIA SHARING STUDIO & EDITOR (#csheet)
          ==================================================================== */}
      <div id="csheet" hidden>
        <div className="ms-topbar">
          <button
            type="button"
            id="csX"
            className="ms-tool-btn"
            title="Discard & close"
            aria-label="Close media studio"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="spacer" />

          <button
            type="button"
            id="msUndoBtn"
            className="ms-tool-btn"
            title="Undo last edit"
            aria-label="Undo"
            hidden
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
            </svg>
          </button>

          <button
            type="button"
            id="msToolCrop"
            className="ms-tool-btn"
            title="Crop photo"
            aria-label="Crop photo"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2v14a2 2 0 0 0 2 2h14" />
              <path d="M18 22V8a2 2 0 0 0-2-2H2" />
            </svg>
          </button>

          <button
            type="button"
            id="msRotateBtn"
            className="ms-tool-btn"
            title="Rotate 90°"
            aria-label="Rotate 90 degrees"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 2v6h-6" />
              <path d="M21 13a9 9 0 1 1-3-7.7L21 8" />
            </svg>
          </button>

          <button
            type="button"
            id="msFlipBtn"
            className="ms-tool-btn"
            title="Flip horizontal"
            aria-label="Flip horizontal"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v18" />
              <path d="M16 7l5 5-5 5V7z" />
              <path d="M8 7l-5 5 5 5V7z" />
            </svg>
          </button>

          <button
            type="button"
            id="msToolFilter"
            className="ms-tool-btn on"
            title="Color filters"
            aria-label="Color filters"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="13.5" cy="6.5" r="2.5" />
              <circle cx="17.5" cy="15.5" r="2.5" />
              <circle cx="8.5" cy="14.5" r="2.5" />
              <circle cx="12" cy="12" r="9.5" />
            </svg>
          </button>

          <button
            type="button"
            id="msToolSticker"
            className="ms-tool-btn"
            title="Add emoji stamp"
            aria-label="Add emoji stamp"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9.5" />
              <path d="M8.2 14.2s1.5 2.1 3.8 2.1 3.8-2.1 3.8-2.1" />
              <path d="M9 9.5h.01M15 9.5h.01" />
            </svg>
          </button>

          <button
            type="button"
            id="msToolText"
            className="ms-tool-btn"
            title="Add text overlay"
            aria-label="Add text overlay"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7V4h16v3" />
              <path d="M9 20h6" />
              <path d="M12 4v16" />
            </svg>
          </button>

          <button
            type="button"
            id="msToolDraw"
            className="ms-tool-btn"
            title="Freehand draw"
            aria-label="Freehand draw"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>

          <button
            type="button"
            id="msHdBtn"
            className="ms-tool-btn pill"
            title="Toggle HD high-resolution upload"
            aria-label="Toggle HD quality"
          >
            <span>HD</span>
          </button>

          <button
            type="button"
            id="msMuteVidBtn"
            className="ms-tool-btn"
            title="Mute or unmute video audio"
            aria-label="Mute video"
            hidden
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          </button>

          <button
            type="button"
            id="msGifModeBtn"
            className="ms-tool-btn pill"
            title="Send short clip as looping GIF"
            aria-label="Send as GIF"
            hidden
          >
            <span>GIF</span>
          </button>
        </div>

        {/* Drawing Subbar */}
        <div id="msDrawBar" className="ms-subbar" hidden>
          <div id="msDrawColors" className="ms-color-palette">
            <button type="button" className="ms-swatch on" data-col="#00A884" aria-label="Emerald" />
            <button type="button" className="ms-swatch" data-col="#FFFFFF" aria-label="White" />
            <button type="button" className="ms-swatch" data-col="#EF4444" aria-label="Red" />
            <button type="button" className="ms-swatch" data-col="#F59E0B" aria-label="Amber" />
            <button type="button" className="ms-swatch" data-col="#3B82F6" aria-label="Blue" />
            <button type="button" className="ms-swatch" data-col="#A855F7" aria-label="Purple" />
            <button type="button" className="ms-swatch" data-col="#EC4899" aria-label="Pink" />
            <button type="button" className="ms-swatch" data-col="#111827" aria-label="Ink" />
          </div>
          <div id="msBrushSizes" className="ms-brush-sizes">
            <button type="button" className="ms-bsize" data-sz="4" aria-label="Fine brush">
              <i />
            </button>
            <button type="button" className="ms-bsize on" data-sz="8" aria-label="Medium brush">
              <i />
            </button>
            <button type="button" className="ms-bsize" data-sz="14" aria-label="Bold brush">
              <i />
            </button>
          </div>
          <button type="button" id="msClearDrawBtn" className="ms-tool-btn pill">
            <span>Clear</span>
          </button>
        </div>

        {/* Emoji Stamp Tray */}
        <div id="msStickerBar" className="ms-subbar" hidden>
          <div id="msStickerTray" className="ms-sticker-tray" />
        </div>

        {/* Video Trim Bar */}
        <div id="msVideoTrim" className="ms-video-trim" hidden>
          <div className="ms-trim-meta">
            <span id="msTrimLabel">0:00 – 0:00</span>
            <b id="msTrimDur">0.0s</b>
          </div>
          <div className="ms-trim-sliders">
            <input id="msTrimStart" type="range" min="0" max="10" step="0.1" defaultValue="0" aria-label="Trim start" />
            <input id="msTrimEnd" type="range" min="0" max="10" step="0.1" defaultValue="10" aria-label="Trim end" />
          </div>
        </div>

        {/* Interactive Text Overlay Modal */}
        <div id="msTextEditor" className="ms-text-editor" hidden>
          <textarea
            id="msTextInput"
            rows={3}
            maxLength={120}
            placeholder="Type text overlay…"
          />
          <div className="ms-text-toolbar">
            <div id="msTextColors" className="ms-color-palette">
              <button type="button" className="ms-swatch on" data-col="#FFFFFF" aria-label="White" />
              <button type="button" className="ms-swatch" data-col="#00A884" aria-label="Emerald" />
              <button type="button" className="ms-swatch" data-col="#FDE047" aria-label="Yellow" />
              <button type="button" className="ms-swatch" data-col="#FB7185" aria-label="Coral" />
              <button type="button" className="ms-swatch" data-col="#38BDF8" aria-label="Sky" />
              <button type="button" className="ms-swatch" data-col="#C084FC" aria-label="Violet" />
            </div>
            <button type="button" id="msTextBgBtn" className="ms-tool-btn pill">
              <span>Style</span>
            </button>
            <button type="button" id="msTextCancel" className="ms-tool-btn pill">
              <span>Cancel</span>
            </button>
            <button type="button" id="msTextDone" className="ms-tool-btn pill on">
              <span>Done</span>
            </button>
          </div>
        </div>

        {/* Central Interactive Canvas / Video Stage */}
        <div id="csPrev" className="csprev">
          <div id="msStageWrap" className="ms-stage-wrap">
            <canvas id="msCanvas" />
            <video id="msVideo" playsInline hidden />
          </div>
        </div>

        {/* Live Photographic Filter Strip */}
        <div id="msFilterStrip" className="ms-filter-strip">
          <button type="button" className="ms-filter-chip on" data-filter="none">
            Original
          </button>
          <button type="button" className="ms-filter-chip" data-filter="pop">
            Pop
          </button>
          <button type="button" className="ms-filter-chip" data-filter="warm">
            Warm
          </button>
          <button type="button" className="ms-filter-chip" data-filter="cool">
            Cool
          </button>
          <button type="button" className="ms-filter-chip" data-filter="chrome">
            Chrome
          </button>
          <button type="button" className="ms-filter-chip" data-filter="bw">
            B&amp;W
          </button>
          <button type="button" className="ms-filter-chip" data-filter="vintage">
            Vintage
          </button>
          <button type="button" className="ms-filter-chip" data-filter="night">
            Night
          </button>
        </div>

        {/* WhatsApp Bottom Caption Bar, View-Once (1), & Destination Chips */}
        <div className="cs-bottom">
          <div className="ms-caption-row">
            <div className="ms-cap-pill">
              <button
                type="button"
                id="csRe"
                className="ms-re-btn"
                title="Choose another file"
                aria-label="Replace file"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </button>
              <input
                id="csCap"
                type="text"
                placeholder="Add a caption…"
                maxLength={300}
                autoComplete="off"
              />
              <button
                type="button"
                id="voT"
                className="vo-pill-btn"
                title="View once · media locks after opening"
                aria-label="Toggle view once"
              >
                1
              </button>
            </div>

            <button
              type="button"
              id="csSend"
              className="ms-send-fab"
              title="Send media"
              aria-label="Send media"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>

          <div id="csProg" className="csprog" hidden>
            <i id="csBar" />
          </div>

          <div className="ms-dest-row">
            <div className="ms-dest-chips">
              <button type="button" id="msDestChat" className="ms-dest-chip on">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.39-4.12-1.07L3 21l1.62-5.1A8.46 8.46 0 0 1 3.5 12 8.5 8.5 0 0 1 12 3.5 8.5 8.5 0 0 1 21 12z" />
                </svg>
                <span>Chat</span>
              </button>

              <button type="button" id="msDestStatus" className="ms-dest-chip">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="9" strokeDasharray="4 2.5" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <span>My Status</span>
              </button>
            </div>
            <div id="csName" className="csname" />
          </div>
        </div>
      </div>

      {/* ====================================================================
          IMAGE LIGHTBOX (#lb) & VIDEO PLAYER (#vp)
          ==================================================================== */}
      <div id="lb" hidden>
        <div className="lbtop">
          <button type="button" id="lbX" className="lbx" title="Close" aria-label="Close viewer">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div id="lbName">Photo</div>
          <div className="spacer" />
          <button type="button" id="lbDots" className="lbx" title="Options" aria-label="Media options">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.9" />
              <circle cx="12" cy="12" r="1.9" />
              <circle cx="12" cy="19" r="1.9" />
            </svg>
          </button>
        </div>

        <div id="lbStage">
          <button type="button" id="lbPrev" className="lbarrow" aria-label="Previous media">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <img id="lbImg" alt="Full screen media" />
          <button type="button" id="lbNext" className="lbarrow" aria-label="Next media">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div id="lbCap" hidden />
        <div id="lbCount" />
      </div>

      <div id="vp" hidden>
        <button type="button" id="vpX" className="csx z-10" title="Close" aria-label="Close video">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div id="vpName">Video</div>
        <div id="vpCap" hidden />
        <div id="vpStage">
          <video id="vpVid" playsInline />
          <button type="button" id="vpBig" className="vpbig" aria-label="Play video">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </button>
        </div>
        <div className="vpbar">
          <div className="vprow">
            <button type="button" id="vpPlay" className="pb" aria-label="Play or pause">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </button>
            <input id="vpSeek" type="range" min="0" max="1000" defaultValue="0" />
            <span id="vpTime">0:00 / 0:00</span>
          </div>
          <div id="vpSpds" className="spds" />
        </div>
      </div>

      {/* ====================================================================
          STORY VIEWER (#story), CREATION STUDIO (#stSheet) & VIEWERS (#viewersModal)
          ==================================================================== */}
      <div id="story" hidden>
        <div id="stBars" />
        <div className="sthdr">
          <div id="stAv" className="avatar sm" />
          <div className="min-w-0">
            <div id="stName">Story</div>
            <div id="stTime">just now</div>
          </div>
          <div className="stspacer" />
          <button
            type="button"
            id="stViewBtn"
            className="lbx"
            title="Story viewers"
            aria-label="Story viewers"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
              <circle cx="12" cy="12" r="2.8" />
            </svg>
          </button>
          <button
            type="button"
            id="stDots"
            className="lbx"
            title="Story options"
            aria-label="Story options"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.9" />
              <circle cx="12" cy="12" r="1.9" />
              <circle cx="12" cy="19" r="1.9" />
            </svg>
          </button>
          <button
            type="button"
            id="stClose"
            className="lbx"
            title="Close story"
            aria-label="Close story"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div id="stStage">
          <div id="stNavL" className="stnav" />
          <div id="stNavR" className="stnav" />
        </div>

        <div id="stCap" />

        <div id="stReplyBar">
          <div id="stReacts" className="stReacts">
            {STORY_REACT_EMOJIS.map(em => (
              <button key={em} type="button" data-e={em}>
                {em}
              </button>
            ))}
          </div>
          <form id="stReplyForm" autoComplete="off">
            <input
              id="stReplyIn"
              type="text"
              placeholder="Reply to story…"
              maxLength={200}
            />
            <button type="submit" id="stReplySend" aria-label="Send story reply">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Story Studio (#stSheet) */}
      <div id="stSheet" hidden>
        <div id="stPanel">
          <div className="st-head">
            <h3>Create 12h Story</h3>
            <button
              type="button"
              id="stX"
              className="iconbtn"
              title="Close"
              aria-label="Close story studio"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="stabs" role="tablist">
            <button type="button" className="stab2 on" data-sst="photo">
              Photo / Video
            </button>
            <button type="button" className="stab2" data-sst="text">
              Gradient Text
            </button>
            <button type="button" className="stab2" data-sst="emoji">
              Live Emoji
            </button>
          </div>

          <div id="sstPhoto">
            <div id="stPrev">
              <span className="text-sm font-semibold opacity-75">
                Tap to choose a photo or video
              </span>
            </div>
            <div id="stName2" className="csname mt-2 text-center" />
            <div className="cscap">
              <input
                id="stCapIn"
                type="text"
                placeholder="Optional story caption…"
                maxLength={120}
              />
            </div>
          </div>

          <div id="sstEmoji" hidden>
            <div id="stEmoPrev" className="stprev big">
              😀
            </div>
            <div id="packChipsS" />
            <div id="emjGridS" className="pp-grid emjs" />
          </div>

          <div id="sstText" hidden>
            <div id="stTxtPrev" className="stprev">
              Type your story below…
            </div>
            <div id="stBgs" className="bgchips" />
            <div className="cscap">
              <input
                id="stTxtIn"
                type="text"
                placeholder="What's on your mind?"
                maxLength={140}
              />
            </div>
          </div>

          <div id="stProg" className="csprog" hidden>
            <i id="stBar" />
          </div>

          <button type="button" id="stSend" className="btn primary mt-4">
            Publish Story
          </button>
        </div>
      </div>

      {/* Story Viewers Modal */}
      <div id="viewersModal" className="modal" hidden>
        <div className="pglass">
          <div className="modal-sheet-head">
            <h3>Story Viewers</h3>
            <button
              type="button"
              id="vClose"
              className="iconbtn"
              aria-label="Close viewers"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div id="vCount" />
          <div id="vlist" />
        </div>
      </div>

      {/* ====================================================================
          PREMIUM GLASS PROFILE CARD (#profModal)
          ==================================================================== */}
      <div id="profModal" className="modal" hidden>
        <div className="pglass">
          <div className="pcard-hero">
            <div id="pAura" className="pcard-aura" aria-hidden="true" />
            <div className="pcard-topbar">
              <span id="pCardTag" className="pcard-tag">
                Contact Card
              </span>
              <button
                type="button"
                id="pClose"
                className="pclose"
                title="Close profile"
                aria-label="Close profile"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="pcard-id-box">
              <div className="pavring">
                <div id="pAv" className="pav">
                  <span id="pDot" className="dot" />
                </div>
                <button
                  type="button"
                  id="pAvEdit"
                  title="Update profile photo"
                  aria-label="Update profile photo"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
                <input id="pAvFile" type="file" accept="image/*" hidden />
              </div>

              <div id="pName" className="pname">
                User
              </div>

              <div className="phandle-row">
                <div id="pBadge" className="pbadge" />
                <span>·</span>
                <button
                  type="button"
                  id="pCopyHandle"
                  className="copy-id-btn"
                  title="Copy user handle"
                >
                  <span>@user</span>
                </button>
              </div>

              <div id="pQuickDock" className="pquick-dock" />
            </div>
          </div>

          <div className="pfrostCard">
            <div className="pbio-section">
              <div className="pbio-label">
                <span>About</span>
                <button
                  type="button"
                  id="pEdit"
                  title="Edit bio"
                  aria-label="Edit bio"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3l4 4L8 20l-5 1 1-5L17 3z" />
                  </svg>
                  <span>Edit</span>
                </button>
              </div>
              <div id="pBio">I am using Vanish Chats</div>
              <input
                id="pBioInput"
                type="text"
                maxLength={120}
                placeholder="Write a short bio…"
              />
            </div>

            <div className="pstats">
              <div className="pstat">
                <b id="stDays">1</b>
                <span>Days active</span>
              </div>
              <div className="pstat">
                <b id="stStatus">Active</b>
                <span>Presence</span>
              </div>
              <div className="pstat">
                <b id="stTtl">40s</b>
                <span>Vanish timer</span>
              </div>
            </div>

            <div id="pMediaSec" className="pmedia-sec" hidden>
              <div className="pmedia-head">
                <span>Shared Media</span>
                <b id="pMediaCount">0 active</b>
              </div>
              <div id="pMediaGrid" className="pmedia-grid" />
            </div>

            <div className="prows">
              <div id="pTimerRow" className="prow">
                <div className="plabel">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  <span>Message Auto-Delete Timer</span>
                </div>
                <div id="tChips" className="tchips" />
                <div className="psub">
                  Outgoing messages dissolve automatically once this timer elapses.
                </div>
              </div>

              <div id="pNotifyRow" className="prow">
                <div className="plabel">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span>Notifications</span>
                </div>
                <button type="button" id="notifyT" className="votoggle">
                  <i aria-hidden="true" />
                  <span>Push notifications for new messages</span>
                </button>
              </div>

              <div className="prow">
                <div className="plabel">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="M3 8l9 6 9-6" />
                  </svg>
                  <span>Account &amp; Activity</span>
                </div>
                <div id="pEmail" className="pval">
                  Private account
                </div>
                <div className="psub flex items-center justify-between gap-2">
                  <span id="pSince">Joined —</span>
                  <span id="pLast">Currently active</span>
                </div>
              </div>
            </div>

            <div id="pActs" className="pacts" />

            <div className="pnote">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.4 4.6-1.25 8-6.15 8-11.4V6l-8-4z" />
              </svg>
              <span>
                Messages and media shared in Vanish Chats are ephemeral and never stored permanently after expiration.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          BLOCKED ACCOUNTS MODAL (#privModal)
          ==================================================================== */}
      <div id="privModal" className="modal" hidden>
        <div className="pglass">
          <div className="modal-sheet-head">
            <h3>Blocked Accounts</h3>
            <button
              type="button"
              id="prClose"
              className="iconbtn"
              aria-label="Close blocked accounts"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div id="blist" className="blist" />
        </div>
      </div>

      {/* ====================================================================
          CATEGORIZED SETTINGS & CUSTOMIZATION (#customizeSheet)
          ==================================================================== */}
      <div id="customizeSheet" hidden>
        <div className="cuzDialog">
          <div className="cuzHead">
            <h2>Settings &amp; Customization</h2>
            <div className="spacer" />
            <button
              type="button"
              id="cuzClose"
              className="iconbtn"
              aria-label="Close settings"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="cuzBody">
            {/* Appearance & Theme */}
            <div className="settings-card">
              <div className="settings-card-head">
                <i aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="4.5" />
                    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M19.4 4.6l-1.8 1.8M6.4 17.6l-1.8 1.8" />
                  </svg>
                </i>
                <h3>Appearance &amp; Theme</h3>
              </div>

              <div className="theme-mode-grid">
                <button type="button" id="themeDarkBtn" className="theme-mode-btn on">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span>Dark Mode</span>
                </button>
                <button type="button" id="themeLightBtn" className="theme-mode-btn">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="4.5" />
                    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
                  </svg>
                  <span>Light Mode</span>
                </button>
              </div>

              <div className="text-xs font-semibold opacity-70 mb-2">Accent Gradient</div>
              <div id="cuzSwatches" className="cuzSwatches" />

              <div className="cuzHexRow">
                <input
                  id="cuzHex1"
                  type="color"
                  defaultValue="#00A884"
                  aria-label="Primary accent color"
                />
                <input
                  id="cuzHex2"
                  type="color"
                  defaultValue="#10B981"
                  aria-label="Secondary accent color"
                />
                <button type="button" id="cuzHexApply">
                  Apply Custom Gradient
                </button>
              </div>
            </div>

            {/* Chat Wallpaper */}
            <div className="settings-card">
              <div className="settings-card-head">
                <i aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="3" />
                    <circle cx="8.5" cy="9.5" r="1.6" />
                    <path d="M21 15l-5-5-9 9" />
                  </svg>
                </i>
                <h3>Chat Wallpaper</h3>
              </div>
              <div id="cuzWallGrid" className="cuzWallGrid" />
              <button type="button" id="cuzWallUpload">
                Upload Custom Photo Wallpaper
              </button>
              <input id="cuzWallFile" type="file" accept="image/*" hidden />
            </div>

            {/* Auto-Delete Timer */}
            <div className="settings-card">
              <div className="settings-card-head">
                <i aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </i>
                <h3>Message Auto-Delete Timer</h3>
              </div>
              <div id="settingsTtlChips" className="tchips" />
            </div>

            {/* Privacy & Notifications */}
            <div className="settings-card">
              <div className="settings-card-head">
                <i aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.4 4.6-1.25 8-6.15 8-11.4V6l-8-4z" />
                  </svg>
                </i>
                <h3>Privacy &amp; Notifications</h3>
              </div>

              <div className="settings-row-btn">
                <span>Message notifications</span>
                <button
                  type="button"
                  id="settingsNotifyToggle"
                  className="votoggle"
                  aria-label="Toggle message notifications"
                >
                  <i aria-hidden="true" />
                </button>
              </div>

              <div className="settings-row-btn">
                <span>Blur screen when window is inactive</span>
                <button
                  type="button"
                  id="settingsShieldToggle"
                  className="votoggle on"
                  aria-label="Toggle privacy shield"
                >
                  <i aria-hidden="true" />
                </button>
              </div>

              <button type="button" id="settingsOpenBlocked" className="settings-row-btn">
                <span>Blocked accounts</span>
                <span id="settingsBlockedCount" className="mono text-xs opacity-75">
                  None
                </span>
              </button>

              <div className="settings-row-btn cuzField">
                <label htmlFor="cuzSwipeSens">Mobile tab swipe sensitivity</label>
                <select id="cuzSwipeSens" defaultValue="70">
                  <option value="50">Fast</option>
                  <option value="70">Balanced</option>
                  <option value="95">Relaxed</option>
                </select>
              </div>
            </div>

            {/* Profile & Account */}
            <div className="settings-card">
              <div className="settings-card-head">
                <i aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c1.8-3.6 5-5.5 8-5.5s6.2 1.9 8 5.5" />
                  </svg>
                </i>
                <h3>Account &amp; Profile</h3>
              </div>

              <button type="button" id="settingsOpenProfile" className="settings-row-btn">
                <span>Edit profile photo &amp; bio</span>
                <span className="text-xs opacity-70">Open →</span>
              </button>
            </div>

            <div className="settings-footer-actions">
              <button type="button" id="cuzReset" className="cuzReset">
                Reset Theme
              </button>
              <button type="button" id="cuzLogoutBtn" className="cuzLogout">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          CIRCULAR AVATAR CROPPER (#avCrop) & PHOTO CROPPER (#cropper)
          ==================================================================== */}
      <div id="avCrop" hidden>
        <div className="avcTitle">Adjust Profile Photo</div>
        <div className="avcStage">
          <canvas id="avCv" width={800} height={800} />
          <div className="avcHole" aria-hidden="true" />
        </div>
        <div className="avcZoom">
          <span className="text-xs opacity-80">Zoom</span>
          <input id="avZoomR" type="range" min="100" max="300" defaultValue="100" />
        </div>
        <div className="avcBtns">
          <button type="button" id="avcCancel" className="cc">
            Cancel
          </button>
          <button type="button" id="avcOk" className="ok">
            Save Photo
          </button>
        </div>
      </div>

      <div id="cropper" hidden>
        <div className="avcTitle">Crop Image</div>
        <div className="avcStage">
          <canvas id="crCv" width={800} height={800} />
          <div className="avcHole rect" aria-hidden="true" />
        </div>
        <div className="avcZoom">
          <span className="text-xs opacity-80">Zoom</span>
          <input id="crZoomR" type="range" min="100" max="300" defaultValue="100" />
        </div>
        <div className="avcBtns">
          <button type="button" id="crCancel" className="cc">
            Cancel
          </button>
          <button type="button" id="crOk" className="ok">
            Apply Crop
          </button>
        </div>
      </div>

      {/* ====================================================================
          LIQUID GLASS CONFIRMATION DIALOG, PRIVACY SHIELD & TOAST
          ==================================================================== */}
      <div id="confirmModal" role="dialog" aria-modal="true" hidden>
        <div className="confirm-card">
          <h3 id="confirmTitle">Confirm</h3>
          <p id="confirmMsg" />
          <div className="confirm-btns">
            <button type="button" id="confirmCancel" className="confirm-cancel">
              Cancel
            </button>
            <button type="button" id="confirmOk" className="confirm-ok">
              Confirm
            </button>
          </div>
        </div>
      </div>

      <div id="shield" aria-label="Privacy shield active">
        <div className="shield-card">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.4 4.6-1.25 8-6.15 8-11.4V6l-8-4z" />
            <rect x="9" y="10" width="6" height="5" rx="1" />
          </svg>
          <h3>Privacy Shield Active</h3>
          <p>Conversation content is blurred while Vanish Chats is in the background.</p>
          <span className="hint">Tap or focus window to resume</span>
        </div>
      </div>

      <div id="toast" role="status" aria-live="polite" />
      <div id="printStop">Printing and screen capture are disabled in Vanish Chats.</div>
    </>
  );
}
