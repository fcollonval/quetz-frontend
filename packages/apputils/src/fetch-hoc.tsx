import { ServerConnection } from '@jupyterlab/services';

import { get } from 'lodash';

import * as React from 'react';

import { API_STATUSES } from './constants';

import { InlineLoader } from './loader';

const genericErrorForStatus = (status: any) => {
  switch (status) {
    case 401:
      return 'Unauthorized API request. Please login';
    default:
      return '';
  }
};

const getErrorMessage = (e: any) => {
  if (get(e, 'detail')) {
    return e.detail;
  }
  return genericErrorForStatus(e.status) || '';
};

export class FetchHoc extends React.PureComponent<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: null,
      apiStatus: API_STATUSES.PENDING,
      error: '',
    };
  }

  componentDidMount = () => {
    this.tryFetch();
  };

  tryFetch = async () => {
    const { url } = this.props;

    this.setState({
      apiStatus: API_STATUSES.PENDING,
    });

    try {
      const request: RequestInit = {
        method: 'GET'
      };
      const settings = ServerConnection.makeSettings();
      const { body } = await ServerConnection.makeRequest(url, request, settings);
      
      this.setState({
        data: body,
        apiStatus: API_STATUSES.SUCCESS,
      });
    } catch (e) {
      this.setState({
        apiStatus: API_STATUSES.FAILED,
        error: getErrorMessage(e),
      });
    }
  };

  render(): JSX.Element {
    const { apiStatus, data, error } = this.state;
    const { children, loadingMessage, genericErrorMessage }: any = this.props;

    if (apiStatus === API_STATUSES.PENDING) {
      return <InlineLoader text={loadingMessage} />;
    }

    if (apiStatus === API_STATUSES.FAILED) {
      return (
        <p className="paragraph padding">
          {error || genericErrorMessage || 'Error occured while fetching data'}
          &emsp;
          <button className="btn btn-inline" onClick={this.tryFetch}>
            Try again
          </button>
        </p>
      );
    }

    return <>{children(data)}</>;
  }
}
