import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  CalendarIcon,
  CloseIcon
} from '../icon';

import RingComponent from '../ring-component/ring-component';
import Popup from '../popup/popup';
import Button from '../button/button';

import DatePopup from './date-popup';
import {dateType, parseDate} from './consts';
import styles from './date-picker.css';

/**
 * @name Date Picker
 * @category Components
 * @framework React
 * @constructor
 * @description Allows picking a date or a date range. Uses [moment.js](http://momentjs.com/) under the hood. You may want either to [bundle only needed locales](https://webpack.js.org/plugins/context-replacement-plugin/#newcontentresource-newcontentrecursive-newcontentregexp) or even to [ignore all of them](https://webpack.js.org/plugins/ignore-plugin/#ignore-moment-locales).
 * @example-file ./date-picker.examples.html
 */

export default class DatePicker extends RingComponent {
  static defaultProps = {
    className: '',
    date: null,
    range: false,
    from: null,
    to: null,
    clear: false,
    displayFormat: 'D MMM YYYY',
    displayMonthFormat: 'D MMM',
    displayDayFormat: 'D',
    inputFormat: 'D MMMM YYYY',
    datePlaceholder: 'Select a date',
    rangePlaceholder: 'Select a date range',
    onChange() {}
  };
  static propTypes = {
    className: PropTypes.string,
    popupClassName: PropTypes.string,
    date: dateType,
    range: PropTypes.bool,
    from: dateType,
    to: dateType,
    clear: PropTypes.bool,
    displayFormat: PropTypes.string,
    displayMonthFormat: PropTypes.string,
    displayDayFormat: PropTypes.string,
    inputFormat: PropTypes.string,
    datePlaceholder: PropTypes.string,
    rangePlaceholder: PropTypes.string,
    onChange: PropTypes.func
  };

  state = {
    showPopup: false
  };

  togglePopup = () => {
    this.setState(({showPopup}) => ({
      showPopup: !showPopup
    }));
  };

  hidePopup = () => {
    this.setState({
      showPopup: false
    });
  };

  clear = e => {
    e.stopPropagation();
    this.props.onChange(
      this.props.range
        ? {from: null, to: null}
        : null
    );
  }

  render() {
    const {
      className,
      popupClassName,
      displayMonthFormat,
      displayDayFormat,
      datePlaceholder,
      rangePlaceholder,
      clear,
      ...datePopupProps
    } = this.props;

    const {
      range,
      displayFormat,
      inputFormat
    } = datePopupProps;

    const classes = classNames(
      styles.container,
      className
    );

    const displayClasses = classNames(
      styles.displayDate,
      {[styles.displayRange]: range}
    );

    const parse = text => parseDate(
      text,
      inputFormat,
      displayFormat
    );

    const date = parse(this.props.date);
    const from = parse(this.props.from);
    const to = parse(this.props.to);

    let text;
    if (!range) {
      text = date ? date.format(displayFormat) : datePlaceholder;
    } else if (!from && !to) {
      text = rangePlaceholder;
    } else if (!to) {
      text = `${from.format(displayFormat)} —`;
    } else if (!from) {
      text = `— ${to.format(displayFormat)}`;
    } else if (!from.isSame(to, 'year')) {
      text = `${from.format(displayFormat)} — ${to.format(displayFormat)}`;
    } else if (!from.isSame(to, 'month')) {
      text = `${from.format(displayMonthFormat)} — ${to.format(displayFormat)}`;
    } else if (!from.isSame(to, 'day')) {
      text = `${from.format(displayDayFormat)} — ${to.format(displayFormat)}`;
    } else {
      text = `${to.format(displayFormat)}`;
    }

    return (
      <div className={classes}>
        <Button
          onClick={this.togglePopup}
          icon={CalendarIcon}
          iconSize={17}
          className={styles.datePicker}
          data-test="ring-date-picker"
        >
          <span
            className={displayClasses}
          >
            {text}
            {clear && (date || from || to) && (
              <CloseIcon
                className={styles.clear}
                size={CloseIcon.Size.Size14}
                onClick={this.clear}
              />
            )}
          </span>
        </Button>
        <Popup
          hidden={!this.state.showPopup}
          onCloseAttempt={this.hidePopup}
          dontCloseOnAnchorClick={true}
          keepMounted={true}
          className={popupClassName}
        >
          <DatePopup
            {...datePopupProps}
            onComplete={this.hidePopup}
          />
        </Popup>
      </div>
    );
  }
}

