import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Flashlight, Image as ImageIcon, X } from 'lucide-react';
import { logBehavioralEvent } from '../utils/logger';

const Scanner = ({ onScan, onBack }) => {
    const [scanning, setScanning] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        // Start camera simulation
        if (scanning) {
            logBehavioralEvent('scanner_open');
            const timer = setTimeout(() => {
                handleScanSuccess('merchant@okaxis');
            }, 2200); // Simulate scan time
            return () => clearTimeout(timer);
        }
    }, [scanning]);

    const handleScanSuccess = (data) => {
        setScanning(false);
        logBehavioralEvent('scanner_success', { data });
        // Beep sound effect simulated here
        setTimeout(() => {
            onScan(data);
        }, 500);
    };

    return (
        <div className="app-shell" style={{ background: '#000', color: 'white' }}>
            <header className="header" style={{ background: 'transparent', position: 'absolute', width: '100%' }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: '8px' }} onClick={onBack}>
                    <ArrowLeft color="white" size={24} />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: '8px' }}>
                        <Flashlight color="white" size={20} />
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: '8px' }}>
                        <X color="white" size={20} onClick={onBack} />
                    </div>
                </div>
            </header>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: '260px',
                    height: '260px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '24px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Scanner Corners */}
                    <div style={{ position: 'absolute', top: -2, left: -2, width: 32, height: 32, borderTop: '4px solid #34a853', borderLeft: '4px solid #34a853', borderTopLeftRadius: 20 }}></div>
                    <div style={{ position: 'absolute', top: -2, right: -2, width: 32, height: 32, borderTop: '4px solid #34a853', borderRight: '4px solid #34a853', borderTopRightRadius: 20 }}></div>
                    <div style={{ position: 'absolute', bottom: -2, left: -2, width: 32, height: 32, borderBottom: '4px solid #34a853', borderLeft: '4px solid #34a853', borderBottomLeftRadius: 20 }}></div>
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 32, height: 32, borderBottom: '4px solid #34a853', borderRight: '4px solid #34a853', borderBottomRightRadius: 20 }}></div>

                    {/* Scan Animation Line */}
                    <div style={{
                        width: '90%',
                        height: '2px',
                        background: '#34a853',
                        boxShadow: '0 0 10px #34a853',
                        animation: 'scan 1.5s infinite linear'
                    }}></div>

                    <style>{`
                 @keyframes scan {
                     0% { transform: translateY(-120px); opacity: 0; }
                     20% { opacity: 1; }
                     80% { opacity: 1; }
                     100% { transform: translateY(120px); opacity: 0; }
                 }
             `}</style>
                </div>

                <p style={{ marginTop: '32px', fontSize: '14px', opacity: 0.8, fontWeight: '500' }}>
                    Scanning for any UPI QR code...
                </p>
            </div>

            <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '24px',
                    backdropFilter: 'blur(10px)'
                }}>
                    <ImageIcon size={20} color="white" />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Upload from gallery</span>
                </div>
            </div>
        </div>
    );
};

export default Scanner;
