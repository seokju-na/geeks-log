import { coerceBooleanProperty } from '@angular/cdk/coercion';
import addons from '@storybook/addons';
import React, { useCallback, useState, useEffect } from 'react';

const ADDON_ID = 'theme-addon';
const PANEL_ID = `${ADDON_ID}/panel`;

function getIsDarkModeDataFromLocalStorage() {
  const isDarkMode = localStorage.getItem('isDarkMode');

  if (isDarkMode !== null) {
    return coerceBooleanProperty(isDarkMode);
  }

  return false;
}

function saveIsDarkModeDataOnLocalStorage(isDarkMode) {
  localStorage.setItem('isDarkMode', isDarkMode.toString());
}

function dispatchChangeThemeEvent(isDarkMode) {
  const iframe = document.getElementById('storybook-preview-iframe');
  const event = new CustomEvent('changeTheme', {
    detail: isDarkMode ? 'dark' : 'light',
  });

  iframe.contentDocument.dispatchEvent(event);
}

function ThemeToggler() {
  const [isDarkMode, setIsDarkMode] = useState(getIsDarkModeDataFromLocalStorage());
  const handleCheckChanged = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    dispatchChangeThemeEvent(isDarkMode);
    saveIsDarkModeDataOnLocalStorage(isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const iframe = document.getElementById('storybook-preview-iframe');

    iframe.onload = () => {
      dispatchChangeThemeEvent(isDarkMode);
    };
  }, []);

  return (
    <div>
      <input
        id="theme-toggler"
        checked={isDarkMode}
        onChange={handleCheckChanged}
        type="checkbox"
      />
      <label htmlFor="theme-toggler">
        Use Dark Mode
      </label>
    </div>
  );
}

addons.register(ADDON_ID, () => {
  const render = ({ key }) => (
    <ThemeToggler key={key}/>
  );

  addons.addPanel(PANEL_ID, {
    title: 'Theme',
    render,
  });
});
