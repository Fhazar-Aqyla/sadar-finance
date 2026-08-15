import React, { useEffect, useState } from 'react';

const FullScreenDropdown = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const syncFullscreenState = () => {
            const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
            const active = Boolean(fullscreenElement);
            setIsFullscreen(active);
            document.body.classList.toggle('fullscreen-enable', active);
        };

        syncFullscreenState();
        document.addEventListener('fullscreenchange', syncFullscreenState);
        document.addEventListener('webkitfullscreenchange', syncFullscreenState);

        return () => {
            document.removeEventListener('fullscreenchange', syncFullscreenState);
            document.removeEventListener('webkitfullscreenchange', syncFullscreenState);
            document.body.classList.remove('fullscreen-enable');
        };
    }, []);

    /*
    full screen
    */
    const toggleFullscreen = async () => {
        const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;

        try {
            if (!fullscreenElement) {
                const requestFullscreen = document.documentElement.requestFullscreen
                    || document.documentElement.webkitRequestFullscreen;
                await requestFullscreen?.call(document.documentElement);
            } else {
                const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
                await exitFullscreen?.call(document);
            }
        } catch {
            document.body.classList.remove('fullscreen-enable');
        }
    };

    return (
        <React.Fragment>
            <div className="header-item sadar-fullscreen-control">
                <button
                    onClick={toggleFullscreen}
                    type="button"
                    className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
                    aria-label={isFullscreen ? 'Keluar dari layar penuh' : 'Aktifkan layar penuh'}
                    title={isFullscreen ? 'Keluar dari layar penuh' : 'Layar penuh'}
                >
                    <i className={isFullscreen ? 'bx bx-exit-fullscreen fs-22' : 'bx bx-fullscreen fs-22'} aria-hidden="true"></i>
                </button>
            </div>
        </React.Fragment>
    );
};

export default FullScreenDropdown;
