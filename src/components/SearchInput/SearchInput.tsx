import React, { Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router';
import axios from 'axios';
import queryString from 'query-string';
import cx from 'classnames';

// import SearchStore from '../../stores/searchStore';
import ResultsStore from '../../stores/resultsStore';
import UIStore from '../../stores/uiStore';

import './SearchInput.scss';
import Input from '../Input';
import Button from '../Button';
import Select from '../Select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import WindowSizeStore from '../../stores/windowSizeStore';

interface IProps extends RouteComponentProps {
  windowSizeStore?: WindowSizeStore;
  resultsStore?: ResultsStore;
  uiStore?: UIStore;
  showButtonText: boolean;
  showGeoLocate: boolean;
  keywordFieldLabel: string;
  postcodeFieldLabel: string;
  openInNewWindow?: boolean;
}

interface IState {
  keyword: string;
  postcode: string;
  radius: number;
  locationCoords: any;
}

const activityRadiusOptions = [
  { value: 5, text: '5 miles' },
  { value: 10, text: '10 miles' },
]

@inject('resultsStore', 'windowSizeStore', 'uiStore')
@observer
class SearchInput extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      keyword: '',
      postcode: '',
      radius: 5,
      locationCoords: null,
    };
  }

  componentDidMount() {
    const { search_term, postcode, radius } = queryString.parse(this.props.location.search);
    const { resultsStore } = this.props;

    if (!resultsStore) {
      return;
    }

    if (search_term) {
      this.setState({
        keyword: search_term as string,
      });
    }

    if (postcode) {
      this.setState({
        postcode: postcode as string,
      });
    }

    if (radius) {
      this.setState({
        radius: Number(radius),
      })
    }
  }

  handleInputChange = (string: string, field: string) => {
    // @ts-ignore
    this.setState({
      [field]: string,
    });
  };

  checkValidation(e: React.ChangeEvent<HTMLButtonElement>) {
    const { resultsStore, openInNewWindow } = this.props;

    e.preventDefault();
    if(this.state.keyword || this.state.postcode) {
      resultsStore!.postcodeChange(this.state.postcode);
      resultsStore!.handleKeywordChange(this.state.keyword);
      resultsStore!.radiusChange(this.state.radius);
      if(openInNewWindow) {
        window.open(`https://connect.nhs.uk/results${resultsStore!.amendSearch()}`);
      } else {
        this.props.history.push({
          pathname: '/results',
          search: resultsStore!.amendSearch()
        });
      }
    } else {
      alert('Please fill in at least one search criteria (keyword/location).');
    }
  };

  getLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      this.reverseGeolocate(position.coords.longitude.toString(), position.coords.latitude.toString());
    });
  };

  reverseGeolocate = async (lon: string, lat: string) => {
    await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&result_type=postal_code&key=${process.env.REACT_APP_GOOGLE_API_KEY}`
    ).then(response => {
      let location = response.data.results[0].formatted_address;

      this.handleInputChange(location, 'postcode');
    })
    .catch(() => {
      alert('Sorry. We are currently unable to determine your location.');
    });
  };

  render() {
    const { resultsStore, windowSizeStore, uiStore, showButtonText, showGeoLocate, keywordFieldLabel, postcodeFieldLabel } = this.props;


    // injected stores must be typed as optional, but will always be there if injected. Allows workound for destructuring values from store
    if (!resultsStore || !windowSizeStore || !uiStore) {
      return null;
    }

    const { isMobile } = windowSizeStore;

    return (
      <Fragment>
        <div
          className={cx('flex-col--12 flex-col--mobile--12 search__input', {
            'flex-col--mobile--12 search__input': isMobile,
          })}
        >
          <div
            className="flex-container search__wrapper"
            style={{
              width: '100%',
              padding: 0,
              justifyContent: 'start',
            }}
          >
            {!resultsStore.isLiveActivity &&
              <div
                className={cx('flex-col--6 flex-col--tablet--12 search__input__item', {
                  'flex-col--mobile--12 search__input__item': isMobile,
                })}
              >
                <label htmlFor="search">{keywordFieldLabel}</label>
                <Input
                  id="search"
                  placeholder="e.g. Anxiety"
                  value={this.state.keyword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    this.handleInputChange(e.target.value, 'keyword')
                  }
                />
              </div>
            }
            <div
              className={cx('flex-col--6 flex-col--tablet--12 search__input__item', {
                'flex-col--mobile--12 search__input__item': isMobile,
              })}
            >
              <label htmlFor="search">{postcodeFieldLabel}</label>
              <Input
                id="location"
                placeholder="e.g SW16 7GZ or Camden"
                value={this.state.postcode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  this.handleInputChange(e.target.value, 'postcode')
                }
              />
              {showGeoLocate &&
                <button
                  type="button"
                  className="link link--medium search__location__link"
                  onClick={(e) => {
                    e.preventDefault();
                    this.getLocation();
                  }}><FontAwesomeIcon icon="search-location" className="link__icon--left" />Get my location</button>
              }
            </div>
            {resultsStore.isLiveActivity &&
              <div
                className={cx('flex-col--6 flex-col--tablet--12 search__input__item', {
                  'flex-col--mobile--12 search__input__item': isMobile,
                })}
              >
                <label htmlFor="activity_radius" className="results__filters__heading">Within a radius of</label>
                <Select
                  className="results__filters__select results__filters__select--main"
                  options={activityRadiusOptions}
                  selected={resultsStore.radius}
                  id="activity_radius"
                  placeholder="Select a radius"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    this.handleInputChange(e.target.value, 'radius');
                  }}
                />
              </div>
            }
            <div
              className={cx('flex-col search__submit', {
                'flex-col--mobile--12 search__submit': isMobile,
              })}>
              <Button
                size="large"
                text={showButtonText ? "Search" : ""}
                icon="search"
                type="submit"
                onClick={(e: React.ChangeEvent<HTMLButtonElement>) => this.checkValidation(e)}
              />
            </div>
          </div>          
        </div>
      </Fragment>
    );
  }
}

export default withRouter(SearchInput);
  