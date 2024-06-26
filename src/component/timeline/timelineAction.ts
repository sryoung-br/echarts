/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import GlobalModel from '../../model/Global';
import TimelineModel from './TimelineModel';
import { defaults } from '@sryoung-br/zrender/src/core/util';
import { Payload } from '../../util/types';
import { EChartsExtensionInstallRegisters } from '../../extension';
import ExtensionAPI from '../../core/ExtensionAPI';

export interface TimelineChangePayload extends Payload {
    type: 'timelineChange'
    currentIndex: number
}
export interface TimelinePlayChangePayload extends Payload {
    type: 'timelinePlayChange'
    playState: boolean
}


export function installTimelineAction(registers: EChartsExtensionInstallRegisters) {
    registers.registerAction(

        {type: 'timelineChange', event: 'timelineChanged', update: 'prepareAndUpdate'},

        function (payload: TimelineChangePayload, ecModel: GlobalModel, api: ExtensionAPI) {

            const timelineModel = ecModel.getComponent('timeline') as TimelineModel;
            if (timelineModel && payload.currentIndex != null) {
                timelineModel.setCurrentIndex(payload.currentIndex);

                if (
                    !timelineModel.get('loop', true)
                    && timelineModel.isIndexMax()
                    && timelineModel.getPlayState()
                ) {
                    timelineModel.setPlayState(false);

                    // The timeline has played to the end, trigger event
                    api.dispatchAction({
                        type: 'timelinePlayChange',
                        playState: false,
                        from: payload.from
                    });
                }
            }

            // Set normalized currentIndex to payload.
            ecModel.resetOption('timeline', { replaceMerge: timelineModel.get('replaceMerge', true) });

            return defaults({
                currentIndex: timelineModel.option.currentIndex
            }, payload);
        }
    );

    registers.registerAction(

        {type: 'timelinePlayChange', event: 'timelinePlayChanged', update: 'update'},

        function (payload: TimelinePlayChangePayload, ecModel: GlobalModel) {
            const timelineModel = ecModel.getComponent('timeline') as TimelineModel;
            if (timelineModel && payload.playState != null) {
                timelineModel.setPlayState(payload.playState);
            }
        }
    );
}