import React from 'react';
// import Table from './table';
import { API_STATUSES, BACKEND_HOST } from './constants';
import { Link } from 'react-router-dom';
import SearchBox from './search';

interface IChannelsApiItem {
  name: string;
  description: string;
  private: boolean;
  size_limit: null | number;
  mirror_channel_url: null | string;
  mirror_mode: null | string;
}

// interface ITableRow {
//   values: IChannelsApiItem;
// }

// the clock's state has one field: The current time, based upon the
// JavaScript class Date
type ChannelsAppState = {
  channels: null | IChannelsApiItem[];
  apiStatus: API_STATUSES;
};

/**
 *
 */
class ChannelsApp extends React.Component<any, ChannelsAppState> {
  constructor(props: any) {
    super(props);
    this.state = {
      channels: null,
      apiStatus: API_STATUSES.PENDING
    };
  }

  async componentDidMount() {
    const fetchResponse = await fetch(`${BACKEND_HOST}/api/channels`);
    const channels = await fetchResponse.json();

    this.setState({
      channels,
      apiStatus: API_STATUSES.SUCCESS
    });
  }

  render(): JSX.Element {
    const { apiStatus, channels } = this.state;

    // const channelColumns = [
    //   {
    //     Header: 'Name',
    //     accessor: 'name',
    //     Cell: ({ row }: { row: ITableRow }) => (
    //       <Link to={`/channels/${row.values.name}`}>{row.values.name}</Link>
    //     )
    //   },
    //   {
    //     Header: 'Description',
    //     accessor: 'description'
    //   },
    //   {
    //     Header: 'Private',
    //     accessor: 'private',
    //     Cell: ({ row }: { row: ITableRow }) =>
    //       row.values.private ? 'Yes' : 'No'
    //   }
    // ];

    if (apiStatus === API_STATUSES.PENDING) {
      return <div>Loading list of available channels</div>;
    }

    return (
      <>
        <div className="breadcrumbs">
          <div className="breadcrumb-item">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
          </div>
          <div className="breadcrumb-separator">&emsp;/&emsp;</div>
          <div className="breadcrumb-item bread">Channels</div>
        </div>
        <h2 className="heading2">Channels</h2>
        <SearchBox />
        {(channels || []).map(channelItem => (
          <Link to={`/channels/${channelItem.name}`} key={channelItem.name}>
            <div className="channel-row">
              <div className="channel-icon-column">
                <img src="/profile_image.png" className="profile-icon" />
              </div>
              <div className="channel-name-column">{channelItem.name}</div>
              <div className="channel-packages-column">254 packages</div>
              <div className="channel-members-column">7 members</div>
            </div>
          </Link>
        ))}
        {/*<Table columns={channelColumns} data={channels} />*/}
      </>
    );
  }
}

export default ChannelsApp;
