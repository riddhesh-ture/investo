import React, { useState, useEffect, useRef } from 'react';

/**
 * Full-page Cloudflare Turnstile verification screen
 * Styled to look like Cloudflare's managed challenge page (dark theme)
 * 
 * Once verified, stores token in sessionStorage so user isn't challenged again
 * during the same browser session.
 * 
 * Requires VITE_TURNSTILE_SITE_KEY env var.
 */

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
const SESSION_KEY = 'investo_verified';

export default function SecurityCheck({ children }) {
    const [verified, setVerified] = useState(false);
    const [checking, setChecking] = useState(true);
    const [needsInteraction, setNeedsInteraction] = useState(false);
    const turnstileRef = useRef(null);
    const widgetRendered = useRef(false);

    // Check if already verified this session
    useEffect(() => {
        if (sessionStorage.getItem(SESSION_KEY) === 'true') {
            setVerified(true);
            setChecking(false);
            return;
        }

        // If no site key configured, skip verification
        if (!SITE_KEY) {
            setVerified(true);
            setChecking(false);
            return;
        }

        setChecking(false);
    }, []);

    // Load Turnstile script and render widget
    useEffect(() => {
        if (verified || checking || !SITE_KEY || widgetRendered.current) return;

        // Timeout fallback — auto-pass after 5 seconds if Turnstile doesn't complete
        const timeout = setTimeout(() => {
            sessionStorage.setItem(SESSION_KEY, 'true');
            setVerified(true);
        }, 5000);

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
        script.async = true;

        window.onTurnstileLoad = () => {
            if (turnstileRef.current && !widgetRendered.current) {
                widgetRendered.current = true;
                window.turnstile.render(turnstileRef.current, {
                    sitekey: SITE_KEY,
                    theme: 'dark',
                    appearance: 'interaction-only',
                    'before-interactive-callback': () => {
                        // Turnstile needs user interaction — show the widget
                        setNeedsInteraction(true);
                    },
                    'after-interactive-callback': () => {
                        setNeedsInteraction(false);
                    },
                    callback: () => {
                        clearTimeout(timeout);
                        setNeedsInteraction(false);
                        setTimeout(() => {
                            sessionStorage.setItem(SESSION_KEY, 'true');
                            setVerified(true);
                        }, 800);
                    },
                });
            }
        };

        document.head.appendChild(script);

        return () => {
            clearTimeout(timeout);
            delete window.onTurnstileLoad;
        };
    }, [verified, checking]);

    if (checking) return null;
    if (verified) return children;

    // Generate a fake Ray ID for aesthetics
    const rayId = Math.random().toString(16).slice(2, 14);

    return (
        <div style={styles.overlay}>
            <div style={styles.container}>
                <div style={styles.card}>
                    <h1 style={styles.siteName}>inv3sto.netlify.app</h1>
                    <h2 style={styles.heading}>Performing security verification</h2>
                    <p style={styles.description}>
                        This website uses a security service to protect against malicious bots.
                        This page is displayed while the website verifies you are not a bot.
                    </p>

                    {/* Turnstile widget container + spinner */}
                    <div style={styles.widgetArea}>
                        <div ref={turnstileRef} style={needsInteraction ? styles.turnstileVisible : styles.turnstileHidden}></div>
                        {!needsInteraction && (
                            <div style={styles.spinnerContainer}>
                                <div style={styles.spinner}></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <div style={styles.divider}></div>
                    <p style={styles.rayId}>Ray ID: {rayId}</p>
                    <p style={styles.branding}>
                        Performance and Security by{' '}
                        <a href="https://www.cloudflare.com" target="_blank" rel="noopener noreferrer" style={styles.link}>
                            Cloudflare
                        </a>
                        {' | '}
                        <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" style={styles.link}>
                            Privacy
                        </a>
                    </p>
                </div>
            </div>

            {/* Spinner animation */}
            <style>{`
                @keyframes cf-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    container: {
        width: '100%',
        maxWidth: 600,
        padding: '0 24px',
        textAlign: 'left',
    },
    card: {
        padding: '40px 0',
    },
    siteName: {
        color: '#ffffff',
        fontSize: '36px',        // ← change site name size here
        fontWeight: 700,
        margin: '0 0 12px 0',
        letterSpacing: '-0.5px',
    },
    heading: {
        color: '#ffffff',
        fontSize: '22px',        // ← change heading size here
        fontWeight: 600,
        margin: '0 0 10px 0',
    },
    description: {
        color: '#cccccc',
        fontSize: '16px',        // ← change description size here
        lineHeight: '1.6',
        margin: '0 0 32px 0',
    },
    widgetArea: {
        position: 'relative',
        minHeight: 65,
    },
    turnstileHidden: {
        position: 'absolute',
        opacity: 0,
        pointerEvents: 'none',
        width: 0,
        height: 0,
        overflow: 'hidden',
    },
    turnstileVisible: {
        marginBottom: 16,
    },
    spinnerContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 8,
    },
    spinner: {
        width: 28,
        height: 28,
        border: '3px solid rgba(255,255,255,0.15)',
        borderTopColor: '#ffffff',
        borderRadius: '50%',
        animation: 'cf-spin 0.8s linear infinite',
    },
    footer: {
        position: 'fixed',
        bottom: 24,
        left: 0,
        right: 0,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
    },
    rayId: {
        color: '#888888',
        fontSize: '12px',
        margin: '0 0 4px 0',
        textAlign: 'center',
    },
    branding: {
        color: '#888888',
        fontSize: '12px',
        margin: 0,
        textAlign: 'center',
    },
    link: {
        color: '#ffffff',
        textDecoration: 'none',
    },
};
