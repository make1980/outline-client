/*
  Copyright 2020 The Outline Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import {DirMixin} from '@polymer/polymer/lib/mixins/dir-mixin.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {hex_md5} from './md5';

class OutlineLoginView extends DirMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
      h3 {
        margin-bottom: 0;
      }
      paper-input {
        margin-top: 0;
        --paper-input-container-focus-color: var(--medium-green);
      }
      </style>

      <div id="main">
        <h3>[[localize('login')]]</h3>

        <paper-input id="usernameInput" always-float-label="" maxlength="100" tabindex="0"></paper-input>
        <paper-input id="passwordInput" always-float-label="" maxlength="100" type="password" tabindex="0"></paper-input>
        <div class="buttons">
          <paper-button dialog-dismiss="">[[localize('cancel')]]</paper-button>
          <paper-button dialog-confirm="" on-tap="_loginSub">[[localize('save')]]</paper-button>
          
        </div>
        <div style="margin:50px;" on-click="_toRegister">[[localize('register')]]</div>
       <!-- <paper-listbox
          selected="{{selectedLanguage}}"
          attr-for-selected="value"
          on-selected-changed="_languageSelected"
        >
          <template is="dom-repeat" items="{{languages}}" as="lang">
            <paper-item class="language-item" value="{{lang.id}}">
              <span class="language-name">{{lang.name}}</span>
              <iron-icon icon="check" hidden$="{{_shouldHideCheckmark(selectedLanguage, lang.id)}}"></iron-icon>
            </paper-item>
          </template>
        </paper-listbox> -->
      </div>
    `;
  }

  static get is() {
    return 'login-view';
  }

  static get properties() {
    return {
      ocalize: Function,
      rootPath: String,
      selectedLanguage: String,

      languages: {
        type: Array,
        readonly: true,
      },
    };
  }
  _toRegister(){
    let url = "https://www.baidu.com/";
    // 打开新窗口
    window.open(url)
  }
  _languageSelected(event) {
    const languageCode = 'en';
    const params = {bubbles: true, composed: true, detail: {languageCode}};
    this.language = languageCode;
    this.dispatchEvent(new CustomEvent('SetLanguageRequested', params));
  }
  _loginSub(event) {
    const username = this.$.usernameInput.value;
    const password = hex_md5(this.$.passwordInput.value);

    const info = {username:username,password:password};

      let _this = this;

    fetch('https://47.94.159.17:22001/shadowsocks_gateway/login/', {
      // fetch('https://mall.66shunsc.com/api/login', {
    // fetch('https://98.207.164.74:22001/shadowsocks_gateway/login/', {

      method: "POST",
      body:"payload=" + JSON.stringify({
        email:username,
        password_md5:password,
      }),
      Origin:window.location.protocol+"//"+window.location.host,
      headers:{
    		"Content-Type":"application/x-www-form-urlencoded"
    	},
      credentials: "same-origin"
    }).then((response) => {
      console.log(response)
      const detail = {text:response.status,duration:100000}
      const params = {bubbles: true, composed: true, detail: detail};
      _this.dispatchEvent(new CustomEvent('ShowToastInJS', params));

      if (response.ok) {
        return response.json();
      }
      const error1 = new Error(response.status);
      error1.response = response;
      throw error1;
    }).then(function(response) {
      

      if(response.success){
        // _this.dispatchEvent(new CustomEvent('SetLoginRequested', {data:response.data.ss_servers}));
        response.data.ss_servers.forEach(item=>{
          debugger
          const detail = {
            accessKey:item.uri,
            name:item.location,
          }
          const params = {bubbles: true, composed: true, detail: detail};
          _this.dispatchEvent(new CustomEvent('AddServerRequested', params));

        })
        const params = {bubbles: true, composed: true, detail: null};
        _this.dispatchEvent(new CustomEvent('SetLoginRequested', params));

      }else{
        const detail = {text:response.data.message,duration:100000}
        const params = {bubbles: true, composed: true, detail: detail};
        // _this.dispatchEvent(new CustomEvent('ShowToastInJS', params));

      }
    }, function(error) {
      console.log(error)
      console.log(error.message)

      const detail = {text:JSON.stringify(error),duration:100000}
      const params = {bubbles: true, composed: true, detail: detail};
      // _this.dispatchEvent(new CustomEvent('ShowToastInJS', params));
      error.message //=> String
    });
  }


}
customElements.define(OutlineLoginView.is, OutlineLoginView);
