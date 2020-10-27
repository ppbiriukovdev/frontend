import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { History } from 'history';

import './Results.scss';
import ResultStore from '../../stores/resultsStore';
import Keyword from './Filters/Keyword';
import ViewFilter from './Filters/ViewFilter/ViewFilter';
import ListView from './ListView';
import MapView from './MapView';

import MetaData from '../../components/MetaData';
import Breadcrumb from '../../components/Breadcrumb';
import Cta from '../../components/Cta';

interface IProps {
  location: Location;
  resultsStore: ResultStore;
  history: History;
}

class Results extends Component<IProps> {
  componentDidMount() {
    const { resultsStore } = this.props;

    resultsStore.getSearchTerms();
  }

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.location.search !== this.props.location.search) {
      const { resultsStore } = this.props;
      resultsStore.clear();
      resultsStore.getSearchTerms();
    }
  }

  componentWillUnmount() {
    const { resultsStore } = this.props;

    resultsStore.clear();
  }

  render() {
    const { resultsStore, history } = this.props;
    return (
      <section>
        <MetaData
          title={`Search Results ${resultsStore.keyword ? 'for ' + resultsStore.keyword : ''}${resultsStore.postcode ? ' in ' + resultsStore.postcode : ''}`}
          metaDescription={`Search Results ${resultsStore.keyword ? 'for ' + resultsStore.keyword : ''}${resultsStore.postcode ? ' in ' + resultsStore.postcode : ''}`}
        />
        <Breadcrumb crumbs={[{ text: 'Home', url: '/' }, { text: 'Search', url: '' }]} />
        <div className="results__search-box">
          <Keyword />
        </div>

        <div className="results__list">
          <div className="flex-container flex-container--justify results__filter-bar">	
            <div className="flex-col--tablet--12 flex-col--10">
              <div className="flex-container flex-container--align-center flex-container--space">
                <div className="flex-col flex-col--6">
                  {!!resultsStore.results.size && !resultsStore.loading && (	
                    <p>{resultsStore.totalItems > 25 ? 'Over 25' : resultsStore.totalItems} service(s) found</p>	
                  )}	
                </div>	
                <div className="flex-col flex-col--6">	
                  <ViewFilter />
                </div>
              </div>
            </div>
          </div>
          
          {resultsStore.nhsResult &&
            <div className="flex-container flex-container--justify results__nhs-results">
              <div className="flex-col--tablet--12 flex-col--10">
                <div className="flex-container">
                  <div className="flex-col flex-col--12">
                    <Cta
                      title={resultsStore.nhsResult.about.name}
                      description={resultsStore.nhsResult.description}
                      buttonUrl={resultsStore.nhsResult.url.replace('api.nhs.uk', 'www.nhs.uk')}
                      />
                  </div>
                </div>
              </div>
            </div>
          }

          {resultsStore.view === 'grid' ? (	
            <ListView resultsStore={resultsStore} history={history} />	
          ) : (	
            <MapView />
          )}
        </div>
      </section>
    );
  }
}

export default inject('resultsStore')(observer(Results));
