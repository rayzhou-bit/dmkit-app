import React from 'react';

import { LOCATION_FIELDS } from '../../constants/location';
import LocationPortrait from './LocationPortrait';
import LocationTextField from './LocationTextField';
import LocationEntryList from './LocationEntryList';

import './Card.scss';

// Canvas body for the location card type - deliberately simple/single-
// column compared to MonsterContent's two collapsible columns: an optional
// portrait, one freeform description, one open-ended entry list. Nothing
// here is required - see constants/location.js's locationHasContent.
const LocationContent = ({ cardId }) => (
  <div className='location-content'>
    <LocationPortrait cardId={cardId} />
    <LocationTextField cardId={cardId} fieldKey='description' {...LOCATION_FIELDS.description} />
    <LocationEntryList cardId={cardId} />
  </div>
);

export default LocationContent;
