import {
    hasProgress
} from './fetchFunction.js';

import {
    svg
} from './global.js';

function message() {
    const
        m = document.createElement('div'),
        m2 = document.createElement('div'),
        tsuzuku = JSON.parse(localStorage.getItem('tsuzuku')) || {},
        v = 68;

    if (!hasProgress || tsuzuku.version === v) {
        return;
    }

    m.style.background = 'var(--side)';
    m.style.display = 'flex';
    m.style.height = '100%';
    m.style.justifyContent = 'center';
    m.style.padding = '19px';
    m.style.position = 'absolute';
    m.style.width = '100%';
    m.style.zIndex = 9;
    m.innerHTML =
        '<div id="message-main" style="overflow: auto;">' +
            '<div>' +
                `<svg viewBox="${svg.viewBox}" width="34" height="34" style="fill: var(--mismatched);">${svg.mismatched}</svg>` +
                '<div style="color: var(--mismatched); font-size: 24px; font-weight: 500; padding-top: 17px;">Warning</div>' +
            '</div>' +
            '<div style="padding-top: 34px;">This latest release of Tsuzuku includes major changes to the app that could have an effect on your personal list.</div>' +
            '<div style="padding-top: 17px;">To be safe, please consider exporting your progress now, then resetting everything, then finally re-importing the file back before continuing.</div>' +
            `<div style="padding-top: 17px;">(Those functions can be found in the side menu by clicking/tapping on <svg viewBox="${svg.viewBox}" width="17" height="17">${svg.menu}</svg> in the header.)</div>` +
            '<div style="padding-top: 17px;">After confirming, this message will not be displayed again.</div>' +
        '</div>';

    m2.style.paddingTop = '51px';
    m2.innerHTML = '<span style="color: var(--selected-header); font-weight: 500;">OK</span>';
    m2.querySelector('span').addEventListener('click', () => {
        tsuzuku.version = v;
        localStorage.setItem('tsuzuku', JSON.stringify(tsuzuku));

        m.remove();
    });

    m.querySelector('#message-main').appendChild(m2);
    document.body.appendChild(m);
}

export {
    message
};