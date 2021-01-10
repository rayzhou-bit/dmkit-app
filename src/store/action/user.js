import * as actionTypes from '../actionTypes';
import * as actions from '../actionIndex';
import { updateObject } from '../../shared/utilityFunctions';

export const updUser = (user) => { return { type: actionTypes.LOAD_USER, user: user }; };