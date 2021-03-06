import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import get from 'lodash/get';

import { withRouter, RouteComponentProps } from 'react-router';
import queryString from 'query-string';

import ResultsStore from '../../../stores/resultsStore';
import WindowSizeStore from '../../../stores/windowSizeStore';
import UIStore from '../../../stores/uiStore';
import SearchInput from '../../../components/SearchInput';
import Checkbox from '../../../components/Checkbox';

interface IProps extends RouteComponentProps {
  resultsStore?: ResultsStore;
  windowSizeStore?: WindowSizeStore;
  uiStore?: UIStore;
}

interface IState {
  keyword: string;
  postcode: string;
  errors: any;
}

@inject('resultsStore', 'windowSizeStore', 'uiStore')
@observer
class Keyword extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      keyword: '',
      postcode: '',
      errors: {
        keyword: false,
      },
    };
  }

  componentDidMount() {
    const { search_term, location } = queryString.parse(this.props.location.search);

    if (search_term) {
      this.setState({
        keyword: search_term as string,
      });
    }

    if (location) {
      this.setState({
        postcode: location as string,
      });
    }
  }

  handleInputChange = (string: string, field: string) => {
    // @ts-ignore
    this.setState({
      [field]: string,
    });
  };

  render() {
    const { resultsStore, windowSizeStore, uiStore } = this.props;

    if (!resultsStore || !windowSizeStore || !uiStore) {
      return null;
    }
    return (
      <form>
        <div className="flex-container flex-container--no-padding">
          <div className="flex-col">
            <h1 className="results__heading">{resultsStore.isLiveActivity ? 'Physical Activities in your area' : 'Results found for'}</h1>
          </div>
        </div>
        <div className="flex-container flex-container--no-padding flex-container--align-center">
          <div className="flex-col" style={{flexGrow: 1}}>
            <div className="flex-container flex-container--no-padding">
              <SearchInput showGeoLocate={true} showButtonText={false} keywordFieldLabel="Keyword" postcodeFieldLabel="Location" />
            </div>
          </div>
          {!resultsStore.isLiveActivity &&
            <div className="flex-col--2 flex-col--tablet--12">
              <Checkbox	
                id="is_free"	
                label="<strong>Cost</strong><br>Free"
                checked={get(resultsStore, 'is_free', false)}	
                onChange={() => {	
                  resultsStore!.toggleIsFree();
                  this.props.history.push({
                    pathname: '/results',
                    search: resultsStore!.amendSearch()
                  });
                }}	
                className="results__keyword-edit-checkbox"	
              />
            </div>
          }
        </div>
      </form>
    );
  }
}

export default withRouter(Keyword);
