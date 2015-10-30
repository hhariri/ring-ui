import Sniffr from 'sniffr';

import DialogNg from '../dialog-ng/dialog-ng';
import './shortcuts-hint-ng.scss';
import '../input/input.scss';
import ShortcutsNg from '../shortcuts-ng/shortcuts-ng';
import HintPopupTpl from './shortcuts-hint-ng.html';
import Icon from '../icon/icon';
import reactNg from '../react-ng/react-ng';
reactNg({Icon});

const HintPopupTplFileName = 'ring-ui/components/shortcuts-hint/shortcuts-hint.html';

/* global angular:false */
let HintPopupModule = angular.module('Ring.shortcuts.hint-popup', [DialogNg, ShortcutsNg, 'Ring.react-ng']);
HintPopupModule.run($templateCache => {
  $templateCache.put(HintPopupTplFileName, HintPopupTpl);
});


/**
 * @name Shortcuts Ng Hint Popup
 * @description Hint popup with help about registered shortcuts
 * @example
 *
<example name="Shortcuts-hint-popup">
  <file name="index.html">
    <div ng-app="test" ng-controller="testCtrl as ctrl">
      <button ng-click="ctrl.showPopup()">Show popup</button>
      <rg-dialog></rg-dialog>
    </div>
  </file>
  <file name="index.js" webpack="true">
    require('angular');
    var ShortcutsHintNg = require('ring-ui/components/shortcuts-hint-ng/shortcuts-hint-ng');

    angular.module('test', [ShortcutsHintNg])
    .config(function(shortcutsProvider) {
      shortcutsProvider
        .mode({id: 'some-kind-shortcuts',
          title: 'Some Action Related Shortcuts',
          shortcuts: [
            {
              key: 'meta+enter',
              action: 'someAction',
              title: 'Do some action shortcut'
            }, {
              key: 'ctrl+shift+down',
              action: 'someAction',
              title: 'Another action shortcut with very very very very very very very very very very long text description'
            }, {
              key: ['ctrl+alt+e', 'shift+down+u'],
              action: 'someAction',
              title: 'Another action shortcut with multiple keys'
            }
          ]
        })
        .mode({
          id: 'some-other-shortcuts',
          title: 'Shortcuts for other actions',
          shortcuts: [
            {
              key: 'meta+=',
              action: 'someAction',
              title: 'Do some action shortcut'
            }, {
              key: 'alt+N',
              action: 'someAction',
              title: 'Another action shortcut with very very long text description'
            }, {
              key: 'shift+left+down',
              action: 'someAction',
              title: 'Another action shortcut'
            }
          ]
        })
    })
    .controller('testCtrl', function($timeout, hintPopup) {
      var ctrl = this;

      ctrl.showPopup = function() {
        hintPopup.show('ShortCuts');
      }

      $timeout(ctrl.showPopup, 200);
    });
  </file>
</example>
*/

class HintPopupService {
  constructor(dialog, shortcuts) {
    this.dialog = dialog;
    this.shortcuts = shortcuts;
  }

  show(title) {
    let modes = this.shortcuts.getRegisteredShortcuts();
    let isArray = it => Array.isArray(it);

    this.dialog.show({
      data: {modes, isArray},
      title,
      wideDialog: true,
      content: HintPopupTplFileName,
      buttons: [{
        label: 'OK',
        default: true,
        action: () => this.dialog.done()
      }]
    });
  }
}

function shortcutKeySymbolFilter(shortcut) {
  let sniffr = new Sniffr();
  sniffr.sniff();

  const MAC_OS = sniffr.os.name === 'macos';
  const KEY_SEPARATOR = MAC_OS ? ' ' : ' + ';

  const macSymbolsMap = {
    enter: '⏎',
    shift: '⇧',
    meta: '⌘',
    alt: '⌥',
    ctrl: '⌃',
    backspace: '⌫',
    esc: 'ESC',

    left: '←',
    up: '↑',
    right: '→',
    down: '↓'
  };

  const winSymbolsMap = {
    enter: 'ENTER',
    shift: 'Shift',
    meta: 'Ctrl',
    alt: 'Alt',
    ctrl: 'Ctrl',
    backspace: 'BACKSPACE',
    esc: 'ESC',

    left: 'LEFT',
    up: 'UP',
    right: 'RIGHT',
    down: 'DOWN'
  };

  const symbolsMap = MAC_OS ? macSymbolsMap : winSymbolsMap;

  return shortcut.
    split(/\+/g).
    map(symbol => symbolsMap[symbol] || symbol).
    join(KEY_SEPARATOR);
}

function shortcutSearchFilter(shortcuts, query = '') {
  return (shortcuts || []).filter(shortcut => {
    let key = shortcut.key.join ? shortcut.key.join(' ') : shortcut.key;
    let keysPresentation = shortcutKeySymbolFilter(key);

    let keyMatches = key.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    let titleMatches = shortcut.title.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    let presentationMatches = keysPresentation.toLowerCase().indexOf(query.toLowerCase()) !== -1;

    return keyMatches || titleMatches || presentationMatches;
  });
}

HintPopupModule.service('hintPopup', HintPopupService);
HintPopupModule.filter('shortcutKeySymbol', () => shortcutKeySymbolFilter);
HintPopupModule.filter('shortcutSearch', () => shortcutSearchFilter);

export default HintPopupModule.name;