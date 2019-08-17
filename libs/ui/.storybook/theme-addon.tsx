import addons, { makeDecorator, types } from '@storybook/addons';
import { API } from '@storybook/api';
import { Channel } from '@storybook/channels';
import { STORY_CHANGED } from '@storybook/core-events';
import * as React from 'react';
import { ChangeEvent, Component, useCallback, useEffect, useState } from 'react';
import {
  backgroundPalettes,
  colorPalettes,
  defaultLightTheme,
  foregroundPalettes,
  GeeksLogUIProvider,
  Theme,
} from '../src';

const ADDON_ID = 'geeksLogTheme';
const PANEL_ID = `${ADDON_ID}/panel`;

interface ThemePanelProps {
  api: API;
  active: boolean;
}

const DEFAULT_THEME = defaultLightTheme;
const colorNames = Object.keys(colorPalettes);

function ThemePanel({ api, active }: ThemePanelProps) {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    api.getChannel().emit(`${PARAM}/themeChanged`, theme);
  }, [api, theme]);

  useEffect(() => {
    const onStoryChanged = () => {
      setTheme(DEFAULT_THEME);
    };

    api.on(STORY_CHANGED, onStoryChanged);

    return () => {
      api.off(STORY_CHANGED, onStoryChanged);
    };
  }, [api]);

  const handleDarkOrLightChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as 'dark' | 'light';

    setTheme(currentTheme => {
      if (value === 'dark') {
        return {
          ...currentTheme,
          isDark: true,
          background: backgroundPalettes.dark,
          foreground: foregroundPalettes.dark,
        };
      } else if (value === 'light') {
        return {
          ...currentTheme,
          isDark: false,
          background: backgroundPalettes.light,
          foreground: foregroundPalettes.light,
        };
      }
    });
  }, []);

  const handlePrimaryColorChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const colorName = event.target.value as keyof typeof colorPalettes;

    setTheme(currentTheme => ({
      ...currentTheme,
      primary: colorPalettes[colorName],
    }));
  }, []);

  if (!active) {
    return null;
  }

  return (
    <div>
      <div>
        <label htmlFor="darkOrLightSelect">Dark or Light</label>
        <select
          id="darkOrLightSelect"
          onChange={handleDarkOrLightChange}
        >
          <option value="light" selected={!theme.isDark}>Light</option>
          <option value="dark" selected={theme.isDark}>Dark</option>
        </select>
      </div>
      <div>
        <label htmlFor="primaryColorSelect">Primary</label>
        <select
          id="primaryColorSelect"
          onChange={handlePrimaryColorChange}
        >
          {colorNames.map(name => (
            <option
              key={name}
              selected={theme.primary === colorPalettes[name]}
              value={name}
            >
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

addons.register(ADDON_ID, api => {
  const render = ({ active, key }) => <ThemePanel key={key} api={api} active={active}/>;

  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Theme',
    render,
  });
});

const PARAM = 'themeProvider';

interface WrapperProps {
  channel: Channel;
}

class Wrapper extends Component<WrapperProps> {
  state = {
    theme: DEFAULT_THEME,
  };

  private onThemeChanged = (theme: Theme) => {
    this.setState({ theme });
  };

  componentDidMount(): void {
    this.props.channel.on(`${PARAM}/themeChanged`, this.onThemeChanged);
  }

  componentWillUnmount(): void {
    this.props.channel.removeListener(`${PARAM}/themeChanged`, this.onThemeChanged);
  }

  render() {
    return (
      <GeeksLogUIProvider theme={this.state.theme}>
        {this.props.children}
      </GeeksLogUIProvider>
    );
  }
}

export const withThemeProvider = makeDecorator({
  name: 'withThemeProvider',
  parameterName: PARAM,
  skipIfNoParametersOrOptions: false,
  wrapper(getStory, context) {
    const channel = addons.getChannel();

    return (
      <Wrapper channel={channel}>
        {getStory(context)}
      </Wrapper>
    );
  },
});
