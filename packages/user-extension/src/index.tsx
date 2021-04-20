import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  IRouter,
} from '@jupyterlab/application';

import { DOMUtils, ReactWidget } from '@jupyterlab/apputils';

import { ServerConnection } from '@jupyterlab/services';

import { URLExt } from '@jupyterlab/coreutils';

import { FetchHoc, Breadcrumbs } from '@quetz-frontend/apputils';

import { ILogInMenu } from '@quetz-frontend/menu';

import { last, capitalize } from 'lodash';

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  NavLink,
} from 'react-router-dom';

import ReactNotification from 'react-notifications-component';

import * as React from 'react';

import UserAPIKey from './api-key';

import UserProfile from './tab-profile';

import UserPackages from './tab-packages';

import UserChannels from './tab-channels';

/**
 * The command ids used by the main plugin.
 */
export namespace CommandIDs {
  export const user = '@quetz-frontend:user';
}

/**
 * The main menu plugin.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: CommandIDs.user,
  autoStart: true,
  requires: [IRouter, ILogInMenu],
  activate: (app: JupyterFrontEnd, router: IRouter, menu: ILogInMenu): void => {
    const { shell, commands } = app;

    commands.addCommand(CommandIDs.user, {
      execute: () => {
        const widget = new UserRouter();
        widget.id = DOMUtils.createDomID();
        widget.title.label = 'User main page';
        widget.title.closable = false;
        shell.add(widget, 'main');
      },
    });

    router.register({
      pattern: /user.*/,
      command: CommandIDs.user,
    });

    menu.addItem({
      id: CommandIDs.user,
      label: 'Profile',
      icon: 'empty',
      api: '/user',
      loggedIn: true,
    });
  },
};

export default plugin;

const getBreadcrumbText = () => {
  const currentSection = last(window.location.pathname.split('/'));
  if (currentSection === 'api-keys') {
    return 'API keys';
  }
  return capitalize(currentSection);
};

class UserComponent extends React.PureComponent<any, any> {
  render() {
    const settings = ServerConnection.makeSettings();
    const url = URLExt.join(settings.baseUrl, '/api/me');
    
    const breadcrumbItems = [
      {
        text: 'Home',
        href: '/',
      },
      {
        text: 'User details',
        link: '/',
      },
      {
        text: getBreadcrumbText(),
      },
    ];
    return (
      <Router basename="/user">
        <ReactNotification />
        <div className="page-contents-width-limit">
          <Breadcrumbs items={breadcrumbItems} />
          <h2 className="heading2">User details</h2>
          <div className="left-right">
            <div className="leftbar">
              <NavLink className="leftbar-item" to="/profile">
                Profile
              </NavLink>
              <NavLink className="leftbar-item" to="/api-keys">
                API key
              </NavLink>
              <NavLink className="leftbar-item" to="/channels">
                Channels
              </NavLink>
              <NavLink className="leftbar-item" to="/packages">
                Packages
              </NavLink>
            </div>
            <div className="right-section">
              <FetchHoc
                url={url}
                loadingMessage="Fetching user information"
                genericErrorMessage="Error fetching user information"
              >
                {(userData: any) => (
                  <Switch>
                    <Route path="/profile">
                      <UserProfile userData={userData} />
                    </Route>
                    <Route path="/api-keys">
                      <UserAPIKey />
                    </Route>
                    <Route path="/channels">
                      <UserChannels username={userData.user.username} />
                    </Route>
                    <Route path="/packages">
                      <UserPackages username={userData.user.username} />
                    </Route>
                    <Route path="/" exact>
                      <Redirect to="/profile" />
                    </Route>
                  </Switch>
                )}
              </FetchHoc>
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

class UserRouter extends ReactWidget {
  render(): React.ReactElement {
    return <UserComponent />;
  }
}
