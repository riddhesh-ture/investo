import React, { useState, useEffect, useRef } from 'react';

/**
 * Security verification interstitial — shows a Cloudflare-style
 * "Performing security verification" page for ~2.5s on first visit.
 * 
 * If VITE_TURNSTILE_SITE_KEY is set, Cloudflare Turnstile runs silently
 * in the background (no visible widget). Otherwise it's purely visual.
 * 
 * Cached in sessionStorage — only shows once per browser session.
 */

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
const SESSION_KEY = 'investo_verified';

export default function SecurityCheck({ children }) {
    const [verified, setVerified] = useState(() => {
        return sessionStorage.getItem(SESSION_KEY) === 'true';
    });
    const turnstileRef = useRef(null);

    useEffect(() => {
        if (verified) return;

        // Auto-pass after 2.5 seconds (visual delay)
        const timer = setTimeout(() => {
            sessionStorage.setItem(SESSION_KEY, 'true');
            setVerified(true);
        }, 2500);

        // If Turnstile key exists, run it silently in the background
        if (SITE_KEY) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
            script.async = true;
            window.onTurnstileLoad = () => {
                if (turnstileRef.current) {
                    window.turnstile.render(turnstileRef.current, {
                        sitekey: SITE_KEY,
                        theme: 'dark',
                        size: 'invisible',
                        callback: () => {
                            clearTimeout(timer);
                            setTimeout(() => {
                                sessionStorage.setItem(SESSION_KEY, 'true');
                                setVerified(true);
                            }, 600);
                        },
                    });
                }
            };
            document.head.appendChild(script);
        }

        return () => clearTimeout(timer);
    }, [verified]);

    if (verified) return children;

    const rayId = Math.random().toString(16).slice(2, 14);

    return (
        <div style={styles.overlay}>
            <div style={styles.container}>
                <h1 style={styles.siteName}>inv3sto.netlify.app</h1>
                <h2 style={styles.heading}>Performing security verification</h2>
                <p style={styles.description}>
                    This website uses a security service to protect against malicious bots.
                    This page is displayed while the website verifies you are not a bot.
                </p>
                <div style={styles.spinnerContainer}>
                    <div style={styles.spinner}></div>
                </div>
                {/* Hidden Turnstile container */}
                <div ref={turnstileRef} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}></div>
            </div>

            <div style={styles.footer}>
                <div style={styles.divider}></div>
                <p style={styles.footerText}>Ray ID: {rayId}</p>
                <p style={styles.footerText}>
                    Performance and Security by{' '}
                    <a href="https://www.cloudflare.com" target="_blank" rel="noopener noreferrer" style={styles.link}>Cloudflare</a>
                    {' | '}
                    <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" style={styles.link}>Privacy</a>
                </p>
            </div>

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
        inset: 0,
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
    },
    siteName: {
        color: '#ffffff',
        fontSize: '32px',       // ← site name size
        fontWeight: 700,
        margin: '0 0 12px 0',
        letterSpacing: '-0.5px',
    },
    heading: {
        color: '#ffffff',
        fontSize: '22px',       // ← heading size
        fontWeight: 600,
        margin: '0 0 10px 0',
    },
    description: {
        color: '#cccccc',
        fontSize: '16px',       // ← description size
        lineHeight: '1.6',
        margin: '0 0 32px 0',
    },
    spinnerContainer: {
        display: 'flex',
        alignItems: 'center',
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
        maxWidth: 600,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    footerText: {
        color: '#888888',
        fontSize: '12px',
        margin: '0 0 4px 0',
        textAlign: 'center',
    },
    link: {
        color: '#ffffff',
        textDecoration: 'none',
    },
};
