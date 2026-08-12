import React from 'react';

//constants
import { layoutModeTypes } from "../../Components/constants/layout";

const LightDark = ({ layoutMode, onChangeLayoutMode }) => {

    const isDark = layoutMode === layoutModeTypes['DARKMODE'];
    const mode = isDark ? layoutModeTypes['LIGHTMODE'] : layoutModeTypes['DARKMODE'];

    return (
        <div className="ms-1 header-item d-flex sadar-theme-toggle">
            <button
                onClick={() => onChangeLayoutMode(mode)}
                type="button"
                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle light-dark-mode"
                aria-label={isDark ? 'Gunakan tema terang' : 'Gunakan tema gelap'}
                title={isDark ? 'Tema terang' : 'Tema gelap'}
            >
                <i className={`bx ${isDark ? 'bx-sun' : 'bx-moon'} fs-22`}></i>
            </button>
        </div>
    );
};

export default LightDark;
