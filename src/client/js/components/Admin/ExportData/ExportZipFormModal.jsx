import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Modal from 'react-bootstrap/es/Modal';
import * as toastr from 'toastr';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';


const GROUPS_PAGE = [
  'pages', 'revisions', 'tags', 'pagetagrelations',
];
const GROUPS_USER = [
  'users', 'externalaccounts', 'usergroups', 'usergrouprelations',
];
const GROUPS_CONFIG = [
  'configs', 'updateposts', 'globalnotificationsettings',
];
const ALL_GROUPED_COLLECTIONS = GROUPS_PAGE.concat(GROUPS_USER).concat(GROUPS_CONFIG);

class ExportZipFormModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedCollections: new Set(),
    };

    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.checkAll = this.checkAll.bind(this);
    this.uncheckAll = this.uncheckAll.bind(this);
    this.export = this.export.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  toggleCheckbox(e) {
    const { target } = e;
    const { name, checked } = target;

    this.setState((prevState) => {
      const selectedCollections = new Set(prevState.selectedCollections);
      if (checked) {
        selectedCollections.add(name);
      }
      else {
        selectedCollections.delete(name);
      }

      return { selectedCollections };
    });
  }

  checkAll() {
    this.setState({ selectedCollections: new Set(this.props.collections) });
  }

  uncheckAll() {
    this.setState({ selectedCollections: new Set() });
  }

  async export(e) {
    e.preventDefault();

    try {
      // TODO: use appContainer.apiv3.post
      const result = await this.props.appContainer.apiPost('/v3/export', { collections: Array.from(this.state.selectedCollections) });
      // TODO: toastSuccess, toastError

      if (!result.ok) {
        throw new Error('Error occured.');
      }

      // TODO: toastSuccess, toastError
      toastr.success(undefined, 'Export process has requested.', {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '1200',
        extendedTimeOut: '150',
      });

      this.props.onExportingRequested();
      this.props.onClose();

      this.setState({ selectedCollections: new Set() });

    }
    catch (err) {
      // TODO: toastSuccess, toastError
      toastr.error(err, 'Error', {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '3000',
      });
    }
  }

  validateForm() {
    return this.state.selectedCollections.size > 0;
  }

  renderWarnForUser() {
    // whether this.state.selectedCollections includes one of GROUPS_USER
    const isUserRelatedDataSelected = GROUPS_USER.some((collectionName) => {
      return this.state.selectedCollections.has(collectionName);
    });

    if (!isUserRelatedDataSelected) {
      return <></>;
    }

    const html = this.props.t('export_management.desc_password_seed');

    // eslint-disable-next-line react/no-danger
    return <div className="well well-sm" dangerouslySetInnerHTML={{ __html: html }}></div>;
  }

  renderGroups(groupList, color) {
    const collectionNames = groupList.filter((collectionName) => {
      return this.props.collections.includes(collectionName);
    });

    return this.renderCheckboxes(collectionNames, color);
  }

  renderOthers() {
    const collectionNames = this.props.collections.filter((collectionName) => {
      return !ALL_GROUPED_COLLECTIONS.includes(collectionName);
    });

    return this.renderCheckboxes(collectionNames);
  }

  renderCheckboxes(collectionNames, color) {
    const checkboxColor = color ? `checkbox-${color}` : 'checkbox-info';

    return (
      <div className={`row checkbox ${checkboxColor}`}>
        {collectionNames.map((collectionName) => {
          return (
            <div className="col-xs-6 my-1" key={collectionName}>
              <input
                type="checkbox"
                id={collectionName}
                name={collectionName}
                className="form-check-input"
                value={collectionName}
                checked={this.state.selectedCollections.has(collectionName)}
                onChange={this.toggleCheckbox}
              />
              <label className="text-capitalize form-check-label ml-3" htmlFor={collectionName}>
                {collectionName}
              </label>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { t } = this.props;

    return (
      <Modal show={this.props.isOpen} onHide={this.props.onClose}>
        <Modal.Header closeButton>
          <Modal.Title>{t('export_management.export_collections')}</Modal.Title>
        </Modal.Header>

        <form onSubmit={this.export}>
          <Modal.Body>
            <div className="row">
              <div className="col-sm-12">
                <button type="button" className="btn btn-sm btn-default mr-2" onClick={this.checkAll}>
                  <i className="fa fa-check-square-o"></i> {t('export_management.check_all')}
                </button>
                <button type="button" className="btn btn-sm btn-default mr-2" onClick={this.uncheckAll}>
                  <i className="fa fa-square-o"></i> {t('export_management.uncheck_all')}
                </button>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-xs-12">
                <legend>Page Collections</legend>
                { this.renderGroups(GROUPS_PAGE) }
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-xs-12">
                <legend>User Collections</legend>
                { this.renderGroups(GROUPS_USER, 'danger') }
                { this.renderWarnForUser() }
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-xs-12">
                <legend>Config Collections</legend>
                { this.renderGroups(GROUPS_CONFIG) }
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-xs-12">
                <legend>Other Collections</legend>
                { this.renderOthers() }
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <button type="button" className="btn btn-sm btn-default" onClick={this.props.onClose}>{t('export_management.cancel')}</button>
            <button type="submit" className="btn btn-sm btn-primary" disabled={!this.validateForm()}>{t('export_management.export')}</button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }

}

ExportZipFormModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onExportingRequested: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  collections: PropTypes.arrayOf(PropTypes.string).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const ExportZipFormModalWrapper = (props) => {
  return createSubscribedElement(ExportZipFormModal, props, [AppContainer]);
};

export default withTranslation()(ExportZipFormModalWrapper);
