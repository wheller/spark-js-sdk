/**!
 *
 * Copyright (c) 2015-2016 Cisco Systems, Inc. See LICENSE file.
 * @private
 */

import {map} from 'lodash';
import {SparkPlugin} from '@ciscospark/spark-core';

const Flag = SparkPlugin.extend({
  namespace: `Flag`,

  /**
  * Archive a flag
  * @param {Object} flag
  * @param {Object} options
  * @returns {Promise<Object>} Resolves with the flag archival
  */
  archive(flag, options) {
    if (!flag.url) {
      return Promise.reject(new Error(`\`flag.url\` is required`));
    }
    options = options || {};
    const params = {
      method: `PUT`,
      uri: flag.url,
      options,
      body: {
        state: `archived`
      }
    };

    return this.spark.request(params)
      .then((res) => res.body);
  },

  /**
  * Flags an activity
  * @param {Object} activity
  * @param {Object} options
  * @returns {Promise<Object>} Resolves with the flag creation
  */
  create(activity, options) {
    if (!activity.url) {
      return Promise.reject(new Error(`\`activity.url\` is required`));
    }
    options = options || {};
    const params = {
      method: `POST`,
      service: `userApps`,
      resource: `/flags`,
      options,
      body: {
        'flag-item': activity.url,
        state: `flagged`
      }
    };

    return this.spark.request(params)
      .then((res) => res.body);
  },

  /**
  * Gets a list of Flags for a user
  * @param {Object} options
  * @returns {Promise} Resolves with the fetched flags
  */
  list(options) {
    options = options || {};
    const params = {
      method: `GET`,
      service: `userApps`,
      resource: `/flags`,
      options,
      qs: {
        state: `flagged`
      }
    };

    return this.spark.request(params)
      .then((res) => res.body.items);
  },

  /**
  * Gets an array of activities where the status is 200
  * @param {Object} flags
  * @returns {Promise<Object>} Resolves with the activities
  * TODO: this should be implemented as a batched request when migrating to the modular sdk
  */
  mapToActivities(flags) {
    const activityUrls = map(flags, `flag-item`);

    const params = {
      method: `POST`,
      api: `conversation`,
      resource: `bulk_activities_fetch`,
      body: {
        activityUrls
      }
    };

    return this.spark.request(params)
      .then((res) => {
        const activitiesArr = [];
        res.body.multistatus.forEach((statusData) => {
          if (statusData.status === `200`) {
            activitiesArr.push(statusData.data.activity);
          }
        });
        return activitiesArr;
      });
  },

  /**
  * Delete a flag
  * @param {Object} flag
  * @param {Object} options
  * @returns {Promise<Object>} Resolves with the flag deletion
  */
  delete(flag, options) {
    if (!flag.url) {
      return Promise.reject(new Error(`\`flag.url\` is required`));
    }
    options = options || {};
    const params = {
      method: `DELETE`,
      options,
      uri: flag.url
    };

    return this.request(params)
      .then((res) => res.body);
  },

  /**
  * UnFlags an activity
  * @param {Object} flag
  * @param {Object} options
  * @returns {Promise<Object>} Resolves with the flag removal
  */
  unflag(flag, options) {
    if (!flag.url) {
      return Promise.reject(new Error(`\`flag.url\` is required`));
    }
    options = options || {};
    const params = {
      method: `PUT`,
      uri: flag.url,
      options,
      body: {
        state: `unflagged`
      }
    };

    return this.spark.request(params)
      .then((res) => res.body);
  }

});

export default Flag;
