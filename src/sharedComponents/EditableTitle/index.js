
import { TEXT_COLOR_WHEN_BACKGROUND_IS } from '../../shared/constants/colors';
import './index.scss';

const EditableTitle = ({
  color,
  title,
}) => {
  return (
    <div
      className="input-wrapper"
    >
      <input
        maxLength="50"
        onDragOver={e => e.preventDefault()}
        required
        style={{
          backgroundColor: color,
          color: TEXT_COLOR_WHEN_BACKGROUND_IS[color],
        }}
        type="text"
        value={title}
      />
    </div>
  );
};

export default EditableTitle;