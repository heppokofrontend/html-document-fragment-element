type AcceptedTypes = string | Node | (string | Node | AcceptedTypes)[] | NodeList | HTMLCollection;

export default class HTMLDocumentFragmentElement extends HTMLElement {
  /**
   * Flatten iterable object
   * @param arg - Arguments received in the constructor
   * @returns - Completely Flattened array
   */
  private static flat(arg: AcceptedTypes[]): (string | Node)[] {
    /**
     * @param items - Arguments received in the constructor
     * @returns - Flattened array
     */
    const loop = (items: any[]): (string | Node)[] => {
      return items.reduce((previous: AcceptedTypes[], current: []) => previous.concat(
        typeof current !== 'string' && current[Symbol.iterator] ?
        loop([...current]) : current
      ), []);
    };

    return loop(arg);
  };

  /**
   * Move the childNodes of that document-fragment element to
   * the DocumentFragment and expose that fragment instead of this element to the DOM.
   */
  private putOut() {
    const fragment = document.createDocumentFragment();
    const childNodes = [...this.childNodes];

    for (const node of childNodes) {
      fragment.append(node);
    }

    this.replaceWith(fragment);
  }

  connectedCallback() {
    if (document.readyState === 'loading') {  // Loading hasn't finished yet
      document.addEventListener('DOMContentLoaded', () => this.putOut());

      return;
    }

    this.putOut();
  }

  constructor(...contents: AcceptedTypes[]) {
    super();

    const items = (() => {
      if (contents.length === 0) {
        return [...this.childNodes];
      }

      return HTMLDocumentFragmentElement.flat([...contents]);
    })();

    for (const content of items) {
      if (typeof content === 'object') {
        try {
          this.appendChild(content);
        } catch (e) {
          throw new TypeError(`The ${String(content)} cannot be included in a HTMLDocumentFragmentElement. Only Node or Element is allowed.`);
        }
      } else {
        this.insertAdjacentHTML('beforeend', content);
      }
    }
  }
}

// コンストラクタ名が難読化で変わってしまうため
Object.defineProperty(HTMLDocumentFragmentElement, 'name', {
  value: 'HTMLDocumentFragmentElement',
});
