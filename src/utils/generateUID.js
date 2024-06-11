import { v4 as uuidv4 } from 'uuid';

export const generateUID = (prefix) => (prefix + uuidv4().slice(0, 8));

export default generateUID;
