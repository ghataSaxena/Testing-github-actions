'use strict';
/*
 *  *************************************************
 *   BH [Highly] Confidential
 *   [Unpublished] Copyright 2025.  Baker Hughes
 *
 *   NOTICE:  All information contained herein is, and remains the property of Baker Hughes, and/or
 *   its affiliates.  The intellectual and technical concepts contained herein are proprietary to Baker Hughes
 *   and/or its affiliates and may be covered by patents, copyrights, and/or trade secrets.  Dissemination of this information or
 *   reproduction of this material is strictly forbidden unless prior written permission is obtained from Baker Hughes.
 *  **************************************************
 *
 */
Object.defineProperty(exports, '__esModule', { value: true });
class ThirdPartySystemHandler {
  constructExternalURLPath(systemKey, systemContext, extraData) {
    return systemContext.currentIdentifier ? `${systemContext.currentIdentifier}` : "null";
  }
}
exports.default = ThirdPartySystemHandler;
