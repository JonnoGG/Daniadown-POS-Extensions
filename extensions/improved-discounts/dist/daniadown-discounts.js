(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // node_modules/@remote-ui/rpc/build/esm/memory.mjs
  function isBasicObject(value) {
    if (value == null || typeof value !== "object") return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype == null || prototype === Object.prototype;
  }

  // node_modules/@remote-ui/core/build/esm/component.mjs
  function createRemoteComponent(componentType) {
    return componentType;
  }

  // node_modules/@remote-ui/core/build/esm/types.mjs
  var ACTION_MOUNT = 0;
  var ACTION_INSERT_CHILD = 1;
  var ACTION_REMOVE_CHILD = 2;
  var ACTION_UPDATE_TEXT = 3;
  var ACTION_UPDATE_PROPS = 4;
  var KIND_ROOT = 0;
  var KIND_COMPONENT = 1;
  var KIND_TEXT = 2;
  var KIND_FRAGMENT = 3;

  // node_modules/@remote-ui/core/build/esm/utilities.mjs
  function isRemoteFragment(object) {
    return object != null && object.kind === KIND_FRAGMENT;
  }

  // node_modules/@remote-ui/core/build/esm/root.mjs
  var FUNCTION_CURRENT_IMPLEMENTATION_KEY = "__current";
  var EMPTY_OBJECT = {};
  var EMPTY_ARRAY = [];
  function createRemoteRoot(channel, {
    strict = true,
    components
  } = {}) {
    let currentId = 0;
    const rootInternals = {
      strict,
      mounted: false,
      channel,
      children: EMPTY_ARRAY,
      nodes: /* @__PURE__ */ new WeakSet(),
      parents: /* @__PURE__ */ new WeakMap(),
      tops: /* @__PURE__ */ new WeakMap(),
      components: /* @__PURE__ */ new WeakMap(),
      fragments: /* @__PURE__ */ new WeakMap()
    };
    if (strict) Object.freeze(components);
    const remoteRoot = {
      kind: KIND_ROOT,
      options: strict ? Object.freeze({
        strict,
        components
      }) : {
        strict,
        components
      },
      get children() {
        return rootInternals.children;
      },
      createComponent(type, ...rest) {
        if (components && components.indexOf(type) < 0) {
          throw new Error(`Unsupported component: ${type}`);
        }
        const [initialProps, initialChildren, ...moreChildren] = rest;
        const normalizedInitialProps = initialProps !== null && initialProps !== void 0 ? initialProps : {};
        const normalizedInitialChildren = [];
        const normalizedInternalProps = {};
        if (initialProps) {
          for (const key of Object.keys(initialProps)) {
            if (key === "children") continue;
            normalizedInternalProps[key] = makeValueHotSwappable(serializeProp(initialProps[key]));
          }
        }
        if (initialChildren) {
          if (Array.isArray(initialChildren)) {
            for (const child of initialChildren) {
              normalizedInitialChildren.push(normalizeChild(child, remoteRoot));
            }
          } else {
            normalizedInitialChildren.push(normalizeChild(initialChildren, remoteRoot));
            for (const child of moreChildren) {
              normalizedInitialChildren.push(normalizeChild(child, remoteRoot));
            }
          }
        }
        const id = `${currentId++}`;
        const internals = {
          externalProps: strict ? Object.freeze(normalizedInitialProps) : normalizedInitialProps,
          internalProps: normalizedInternalProps,
          children: strict ? Object.freeze(normalizedInitialChildren) : normalizedInitialChildren
        };
        const component = __spreadValues({
          kind: KIND_COMPONENT,
          get children() {
            return internals.children;
          },
          get props() {
            return internals.externalProps;
          },
          get remoteProps() {
            return internals.internalProps;
          },
          remove: () => remove(component),
          updateProps: (newProps) => updateProps(component, newProps, internals, rootInternals),
          append: (...children) => append(component, children.map((child) => normalizeChild(child, remoteRoot)), internals, rootInternals),
          appendChild: (child) => appendChild(component, normalizeChild(child, remoteRoot), internals, rootInternals),
          removeChild: (child) => removeChild(component, child, internals, rootInternals),
          replaceChildren: (...children) => replaceChildren(component, children.map((child) => normalizeChild(child, remoteRoot)), internals, rootInternals),
          insertBefore: (child, before) => insertBefore(component, normalizeChild(child, remoteRoot), before, internals, rootInternals),
          insertChildBefore: (child, before) => insertBefore(component, normalizeChild(child, remoteRoot), before, internals, rootInternals)
        }, EMPTY_OBJECT);
        rootInternals.components.set(component, internals);
        Object.defineProperty(component, "type", {
          value: type,
          configurable: false,
          writable: false,
          enumerable: true
        });
        makePartOfTree(component, rootInternals);
        makeRemote(component, id, remoteRoot);
        for (const child of internals.children) {
          moveNodeToContainer(component, child, rootInternals);
        }
        return component;
      },
      createText(content = "") {
        const id = `${currentId++}`;
        const internals = {
          text: content
        };
        const update = (newText) => updateText(text, newText, internals, rootInternals);
        const text = __spreadValues({
          kind: KIND_TEXT,
          get text() {
            return internals.text;
          },
          update,
          updateText: update,
          remove: () => remove(text)
        }, EMPTY_OBJECT);
        makePartOfTree(text, rootInternals);
        makeRemote(text, id, remoteRoot);
        return text;
      },
      createFragment() {
        const id = `${currentId++}`;
        const internals = {
          children: strict ? Object.freeze([]) : []
        };
        const fragment = __spreadValues({
          kind: KIND_FRAGMENT,
          get children() {
            return internals.children;
          },
          append: (...children) => append(fragment, children.map((child) => normalizeChild(child, remoteRoot)), internals, rootInternals),
          appendChild: (child) => appendChild(fragment, normalizeChild(child, remoteRoot), internals, rootInternals),
          removeChild: (child) => removeChild(fragment, child, internals, rootInternals),
          replaceChildren: (...children) => replaceChildren(fragment, children.map((child) => normalizeChild(child, remoteRoot)), internals, rootInternals),
          insertBefore: (child, before) => insertBefore(fragment, normalizeChild(child, remoteRoot), before, internals, rootInternals),
          insertChildBefore: (child, before) => insertBefore(fragment, normalizeChild(child, remoteRoot), before, internals, rootInternals)
        }, EMPTY_OBJECT);
        rootInternals.fragments.set(fragment, internals);
        makePartOfTree(fragment, rootInternals);
        makeRemote(fragment, id, remoteRoot);
        return fragment;
      },
      append: (...children) => append(remoteRoot, children.map((child) => normalizeChild(child, remoteRoot)), rootInternals, rootInternals),
      appendChild: (child) => appendChild(remoteRoot, normalizeChild(child, remoteRoot), rootInternals, rootInternals),
      replaceChildren: (...children) => replaceChildren(remoteRoot, children.map((child) => normalizeChild(child, remoteRoot)), rootInternals, rootInternals),
      removeChild: (child) => removeChild(remoteRoot, child, rootInternals, rootInternals),
      insertBefore: (child, before) => insertBefore(remoteRoot, normalizeChild(child, remoteRoot), before, rootInternals, rootInternals),
      insertChildBefore: (child, before) => insertBefore(remoteRoot, normalizeChild(child, remoteRoot), before, rootInternals, rootInternals),
      mount() {
        if (rootInternals.mounted) return Promise.resolve();
        rootInternals.mounted = true;
        return Promise.resolve(channel(ACTION_MOUNT, rootInternals.children.map(serializeChild)));
      }
    };
    return remoteRoot;
  }
  function connected(element, {
    tops
  }) {
    var _tops$get;
    return ((_tops$get = tops.get(element)) === null || _tops$get === void 0 ? void 0 : _tops$get.kind) === KIND_ROOT;
  }
  function allDescendants(element, withEach) {
    const recurse = (element2) => {
      if ("children" in element2) {
        for (const child of element2.children) {
          withEach(child);
          recurse(child);
        }
      }
    };
    recurse(element);
  }
  function perform(element, rootInternals, {
    remote,
    local
  }) {
    const {
      mounted,
      channel
    } = rootInternals;
    if (mounted && (element.kind === KIND_ROOT || connected(element, rootInternals))) {
      remote(channel);
    }
    local();
  }
  function updateText(text, newText, internals, rootInternals) {
    return perform(text, rootInternals, {
      remote: (channel) => channel(ACTION_UPDATE_TEXT, text.id, newText),
      local: () => {
        internals.text = newText;
      }
    });
  }
  var IGNORE = Symbol("ignore");
  function updateProps(component, newProps, internals, rootInternals) {
    const {
      strict
    } = rootInternals;
    const {
      internalProps: currentProps,
      externalProps: currentExternalProps
    } = internals;
    const normalizedNewProps = {};
    const hotSwapFunctions = [];
    let hasRemoteChange = false;
    for (const key of Object.keys(newProps)) {
      if (key === "children") continue;
      const currentExternalValue = currentExternalProps[key];
      const newExternalValue = newProps[key];
      const currentValue = currentProps[key];
      const newValue = serializeProp(newExternalValue);
      if (currentValue === newValue && (newValue == null || typeof newValue !== "object")) {
        continue;
      }
      const [value, hotSwaps] = tryHotSwappingValues(currentValue, newValue);
      if (hotSwaps) {
        hotSwapFunctions.push(...hotSwaps);
      }
      if (value === IGNORE) continue;
      hasRemoteChange = true;
      normalizedNewProps[key] = value;
      if (isRemoteFragment(currentExternalValue)) {
        removeNodeFromContainer(currentExternalValue, rootInternals);
      }
      if (isRemoteFragment(newExternalValue)) {
        moveNodeToContainer(component, newExternalValue, rootInternals);
      }
    }
    return perform(component, rootInternals, {
      remote: (channel) => {
        if (hasRemoteChange) {
          channel(ACTION_UPDATE_PROPS, component.id, normalizedNewProps);
        }
      },
      local: () => {
        const mergedExternalProps = __spreadValues(__spreadValues({}, currentExternalProps), newProps);
        internals.externalProps = strict ? Object.freeze(mergedExternalProps) : mergedExternalProps;
        internals.internalProps = __spreadValues(__spreadValues({}, internals.internalProps), normalizedNewProps);
        for (const [hotSwappable, newValue] of hotSwapFunctions) {
          hotSwappable[FUNCTION_CURRENT_IMPLEMENTATION_KEY] = newValue;
        }
      }
    });
  }
  function tryHotSwappingValues(currentValue, newValue, seen = /* @__PURE__ */ new Set()) {
    if (seen.has(currentValue)) {
      return [IGNORE];
    }
    if (typeof currentValue === "function" && FUNCTION_CURRENT_IMPLEMENTATION_KEY in currentValue) {
      seen.add(currentValue);
      const result2 = [typeof newValue === "function" ? IGNORE : makeValueHotSwappable(newValue), [[currentValue, newValue]]];
      return result2;
    }
    if (Array.isArray(currentValue)) {
      seen.add(currentValue);
      const result2 = tryHotSwappingArrayValues(currentValue, newValue, seen);
      return result2;
    }
    if (isBasicObject(currentValue) && !isRemoteFragment(currentValue)) {
      seen.add(currentValue);
      const result2 = tryHotSwappingObjectValues(currentValue, newValue, seen);
      return result2;
    }
    const result = [currentValue === newValue ? IGNORE : newValue];
    return result;
  }
  function makeValueHotSwappable(value, seen = /* @__PURE__ */ new Map()) {
    const seenValue = seen.get(value);
    if (seenValue) return seenValue;
    if (isRemoteFragment(value)) {
      seen.set(value, value);
      return value;
    }
    if (Array.isArray(value)) {
      const result = [];
      seen.set(value, result);
      for (const nested of value) {
        result.push(makeValueHotSwappable(nested, seen));
      }
      return result;
    }
    if (isBasicObject(value)) {
      const result = {};
      seen.set(value, result);
      for (const key of Object.keys(value)) {
        result[key] = makeValueHotSwappable(value[key], seen);
      }
      return result;
    }
    if (typeof value === "function") {
      const wrappedFunction = (...args) => {
        return wrappedFunction[FUNCTION_CURRENT_IMPLEMENTATION_KEY](...args);
      };
      Object.defineProperty(wrappedFunction, FUNCTION_CURRENT_IMPLEMENTATION_KEY, {
        enumerable: false,
        configurable: false,
        writable: true,
        value
      });
      seen.set(value, wrappedFunction);
      return wrappedFunction;
    }
    return value;
  }
  function collectNestedHotSwappableValues(value, seen = /* @__PURE__ */ new Set()) {
    if (seen.has(value)) return void 0;
    seen.add(value);
    if (Array.isArray(value)) {
      return value.reduce((all, element) => {
        const nested = collectNestedHotSwappableValues(element, seen);
        return nested ? [...all, ...nested] : all;
      }, []);
    }
    if (isBasicObject(value)) {
      return Object.keys(value).reduce((all, key) => {
        const nested = collectNestedHotSwappableValues(value[key], seen);
        return nested ? [...all, ...nested] : all;
      }, []);
    }
    if (typeof value === "function") {
      return FUNCTION_CURRENT_IMPLEMENTATION_KEY in value ? [value] : void 0;
    }
    return void 0;
  }
  function remove(child) {
    var _child$parent;
    (_child$parent = child.parent) === null || _child$parent === void 0 ? void 0 : _child$parent.removeChild(child);
  }
  function append(container, children, internals, rootInternals) {
    for (const child of children) {
      appendChild(container, child, internals, rootInternals);
    }
  }
  function appendChild(container, child, internals, rootInternals) {
    var _currentParent$childr;
    const {
      nodes,
      strict
    } = rootInternals;
    if (!nodes.has(child)) {
      throw new Error(`Cannot append a node that was not created by this remote root`);
    }
    const currentParent = child.parent;
    const existingIndex = (_currentParent$childr = currentParent === null || currentParent === void 0 ? void 0 : currentParent.children.indexOf(child)) !== null && _currentParent$childr !== void 0 ? _currentParent$childr : -1;
    return perform(container, rootInternals, {
      remote: (channel) => {
        channel(ACTION_INSERT_CHILD, container.id, existingIndex < 0 ? container.children.length : container.children.length - 1, serializeChild(child), currentParent ? currentParent.id : false);
      },
      local: () => {
        moveNodeToContainer(container, child, rootInternals);
        let newChildren;
        if (currentParent) {
          const currentInternals = getCurrentInternals(currentParent, rootInternals);
          const currentChildren = [...currentInternals.children];
          currentChildren.splice(existingIndex, 1);
          if (currentParent === container) {
            newChildren = currentChildren;
          } else {
            currentInternals.children = strict ? Object.freeze(currentChildren) : currentChildren;
            newChildren = [...internals.children];
          }
        } else {
          newChildren = [...internals.children];
        }
        newChildren.push(child);
        internals.children = strict ? Object.freeze(newChildren) : newChildren;
      }
    });
  }
  function replaceChildren(container, children, internals, rootInternals) {
    for (const child of container.children) {
      removeChild(container, child, internals, rootInternals);
    }
    append(container, children, internals, rootInternals);
  }
  function removeChild(container, child, internals, rootInternals) {
    const {
      strict
    } = rootInternals;
    const childIndex = container.children.indexOf(child);
    if (childIndex === -1) {
      return void 0;
    }
    return perform(container, rootInternals, {
      remote: (channel) => channel(ACTION_REMOVE_CHILD, container.id, childIndex),
      local: () => {
        removeNodeFromContainer(child, rootInternals);
        const newChildren = [...internals.children];
        newChildren.splice(newChildren.indexOf(child), 1);
        internals.children = strict ? Object.freeze(newChildren) : newChildren;
      }
    });
  }
  function insertBefore(container, child, before, internals, rootInternals) {
    var _currentParent$childr2;
    const {
      strict,
      nodes
    } = rootInternals;
    if (!nodes.has(child)) {
      throw new Error(`Cannot insert a node that was not created by this remote root`);
    }
    const currentParent = child.parent;
    const existingIndex = (_currentParent$childr2 = currentParent === null || currentParent === void 0 ? void 0 : currentParent.children.indexOf(child)) !== null && _currentParent$childr2 !== void 0 ? _currentParent$childr2 : -1;
    return perform(container, rootInternals, {
      remote: (channel) => {
        const beforeIndex = before == null ? container.children.length - 1 : container.children.indexOf(before);
        channel(ACTION_INSERT_CHILD, container.id, beforeIndex < existingIndex || existingIndex < 0 ? beforeIndex : beforeIndex - 1, serializeChild(child), currentParent ? currentParent.id : false);
      },
      local: () => {
        moveNodeToContainer(container, child, rootInternals);
        let newChildren;
        if (currentParent) {
          const currentInternals = getCurrentInternals(currentParent, rootInternals);
          const currentChildren = [...currentInternals.children];
          currentChildren.splice(existingIndex, 1);
          if (currentParent === container) {
            newChildren = currentChildren;
          } else {
            currentInternals.children = strict ? Object.freeze(currentChildren) : currentChildren;
            newChildren = [...internals.children];
          }
        } else {
          newChildren = [...internals.children];
        }
        if (before == null) {
          newChildren.push(child);
        } else {
          newChildren.splice(newChildren.indexOf(before), 0, child);
        }
        internals.children = strict ? Object.freeze(newChildren) : newChildren;
      }
    });
  }
  function normalizeChild(child, root) {
    return typeof child === "string" ? root.createText(child) : child;
  }
  function moveNodeToContainer(container, node, rootInternals) {
    const {
      tops,
      parents
    } = rootInternals;
    const newTop = container.kind === KIND_ROOT ? container : tops.get(container);
    tops.set(node, newTop);
    parents.set(node, container);
    moveFragmentToContainer(node, rootInternals);
    allDescendants(node, (descendant) => {
      tops.set(descendant, newTop);
      moveFragmentToContainer(descendant, rootInternals);
    });
  }
  function moveFragmentToContainer(node, rootInternals) {
    if (node.kind !== KIND_COMPONENT) return;
    const props = node.props;
    if (!props) return;
    Object.values(props).forEach((prop) => {
      if (!isRemoteFragment(prop)) return;
      moveNodeToContainer(node, prop, rootInternals);
    });
  }
  function removeNodeFromContainer(node, rootInternals) {
    const {
      tops,
      parents
    } = rootInternals;
    tops.delete(node);
    parents.delete(node);
    allDescendants(node, (descendant) => {
      tops.delete(descendant);
      removeFragmentFromContainer(descendant, rootInternals);
    });
    removeFragmentFromContainer(node, rootInternals);
  }
  function removeFragmentFromContainer(node, rootInternals) {
    if (node.kind !== KIND_COMPONENT) return;
    const props = node.remoteProps;
    for (const key of Object.keys(props !== null && props !== void 0 ? props : {})) {
      const prop = props[key];
      if (!isRemoteFragment(prop)) continue;
      removeNodeFromContainer(prop, rootInternals);
    }
  }
  function makePartOfTree(node, {
    parents,
    tops,
    nodes
  }) {
    nodes.add(node);
    Object.defineProperty(node, "parent", {
      get() {
        return parents.get(node);
      },
      configurable: true,
      enumerable: true
    });
    Object.defineProperty(node, "top", {
      get() {
        return tops.get(node);
      },
      configurable: true,
      enumerable: true
    });
  }
  function serializeChild(value) {
    return value.kind === KIND_TEXT ? {
      id: value.id,
      kind: value.kind,
      text: value.text
    } : {
      id: value.id,
      kind: value.kind,
      type: value.type,
      props: value.remoteProps,
      children: value.children.map((child) => serializeChild(child))
    };
  }
  function serializeProp(prop) {
    if (isRemoteFragment(prop)) {
      return serializeFragment(prop);
    }
    return prop;
  }
  function serializeFragment(value) {
    return {
      id: value.id,
      kind: value.kind,
      get children() {
        return value.children.map((child) => serializeChild(child));
      }
    };
  }
  function getCurrentInternals(currentParent, rootInternals) {
    if (currentParent.kind === KIND_ROOT) {
      return rootInternals;
    }
    if (currentParent.kind === KIND_FRAGMENT) {
      return rootInternals.fragments.get(currentParent);
    }
    return rootInternals.components.get(currentParent);
  }
  function makeRemote(value, id, root) {
    Object.defineProperty(value, "id", {
      value: id,
      configurable: true,
      writable: false,
      enumerable: false
    });
    Object.defineProperty(value, "root", {
      value: root,
      configurable: true,
      writable: false,
      enumerable: false
    });
  }
  function tryHotSwappingObjectValues(currentValue, newValue, seen) {
    if (!isBasicObject(newValue)) {
      var _collectNestedHotSwap;
      return [makeValueHotSwappable(newValue), (_collectNestedHotSwap = collectNestedHotSwappableValues(currentValue)) === null || _collectNestedHotSwap === void 0 ? void 0 : _collectNestedHotSwap.map((hotSwappable) => [hotSwappable, void 0])];
    }
    let hasChanged = false;
    const hotSwaps = [];
    const normalizedNewValue = {};
    for (const key in currentValue) {
      const currentObjectValue = currentValue[key];
      if (!(key in newValue)) {
        hasChanged = true;
        const nestedHotSwappables = collectNestedHotSwappableValues(currentObjectValue);
        if (nestedHotSwappables) {
          hotSwaps.push(...nestedHotSwappables.map((hotSwappable) => [hotSwappable, void 0]));
        }
      }
      const newObjectValue = newValue[key];
      const [updatedValue, elementHotSwaps] = tryHotSwappingValues(currentObjectValue, newObjectValue, seen);
      if (elementHotSwaps) {
        hotSwaps.push(...elementHotSwaps);
      }
      if (updatedValue !== IGNORE) {
        hasChanged = true;
        normalizedNewValue[key] = updatedValue;
      }
    }
    for (const key in newValue) {
      if (key in normalizedNewValue) continue;
      hasChanged = true;
      normalizedNewValue[key] = makeValueHotSwappable(newValue[key]);
    }
    return [hasChanged ? normalizedNewValue : IGNORE, hotSwaps];
  }
  function tryHotSwappingArrayValues(currentValue, newValue, seen) {
    if (!Array.isArray(newValue)) {
      var _collectNestedHotSwap2;
      return [makeValueHotSwappable(newValue), (_collectNestedHotSwap2 = collectNestedHotSwappableValues(currentValue)) === null || _collectNestedHotSwap2 === void 0 ? void 0 : _collectNestedHotSwap2.map((hotSwappable) => [hotSwappable, void 0])];
    }
    let hasChanged = false;
    const hotSwaps = [];
    const newLength = newValue.length;
    const currentLength = currentValue.length;
    const maxLength = Math.max(currentLength, newLength);
    const normalizedNewValue = [];
    for (let i = 0; i < maxLength; i++) {
      const currentArrayValue = currentValue[i];
      const newArrayValue = newValue[i];
      if (i < newLength) {
        if (i >= currentLength) {
          hasChanged = true;
          normalizedNewValue[i] = makeValueHotSwappable(newArrayValue);
          continue;
        }
        const [updatedValue, elementHotSwaps] = tryHotSwappingValues(currentArrayValue, newArrayValue, seen);
        if (elementHotSwaps) hotSwaps.push(...elementHotSwaps);
        if (updatedValue === IGNORE) {
          normalizedNewValue[i] = currentArrayValue;
          continue;
        }
        hasChanged = true;
        normalizedNewValue[i] = updatedValue;
      } else {
        hasChanged = true;
        const nestedHotSwappables = collectNestedHotSwappableValues(currentArrayValue);
        if (nestedHotSwappables) {
          hotSwaps.push(...nestedHotSwappables.map((hotSwappable) => [hotSwappable, void 0]));
        }
      }
    }
    return [hasChanged ? normalizedNewValue : IGNORE, hotSwaps];
  }

  // node_modules/@shopify/ui-extensions/build/esm/utilities/registration.mjs
  function createExtensionRegistrationFunction() {
    const extensionWrapper = (target, implementation) => {
      var _shopify;
      function extension2(...args) {
        return __async(this, null, function* () {
          if (args.length === 1) {
            return implementation(...args);
          }
          const [{
            channel,
            components
          }, api] = args;
          const root = createRemoteRoot(channel, {
            components,
            strict: true
          });
          let renderResult = implementation(root, api);
          if (typeof renderResult === "object" && renderResult != null && "then" in renderResult) {
            renderResult = yield renderResult;
          }
          root.mount();
          return renderResult;
        });
      }
      (_shopify = globalThis.shopify) === null || _shopify === void 0 ? void 0 : _shopify.extend(target, extension2);
      return extension2;
    };
    return extensionWrapper;
  }

  // node_modules/@shopify/ui-extensions/build/esm/surfaces/point-of-sale/extension.mjs
  var extension = createExtensionRegistrationFunction();

  // node_modules/@shopify/ui-extensions/build/esm/surfaces/point-of-sale/render/components/Button/Button.mjs
  var Button = createRemoteComponent("Button");

  // node_modules/@shopify/ui-extensions/build/esm/surfaces/point-of-sale/render/components/Screen/Screen.mjs
  var Screen = createRemoteComponent("Screen");

  // node_modules/@shopify/ui-extensions/build/esm/surfaces/point-of-sale/render/components/ScrollView/ScrollView.mjs
  var ScrollView = createRemoteComponent("ScrollView");

  // node_modules/@shopify/ui-extensions/build/esm/surfaces/point-of-sale/render/components/Stack/Stack.mjs
  var Stack = createRemoteComponent("Stack");

  // node_modules/@shopify/ui-extensions/build/esm/surfaces/point-of-sale/render/components/Tile/Tile.mjs
  var Tile = createRemoteComponent("Tile");

  // extensions/improved-discounts/src/Tile.ts
  var Tile_default = extension("pos.home.tile.render", (root, api) => {
    const shouldEnable = (subtotal, customer) => {
      return Boolean(Number(subtotal) && customer);
    };
    const updateInstructionMsg = (subtotal, customer) => {
      if (Number(subtotal) && customer) {
        return "Employee & designer discounts.";
      } else if (Number(subtotal)) {
        return "Employee & designer discounts.\nPlease add customer.";
      } else if (customer) {
        return "Employee & designer discounts.\nPlease add products.";
      } else {
        return "Employee & designer discounts.\nPlease add products & customer.";
      }
    };
    const tile = root.createComponent(Tile, {
      title: "DD Discounts",
      subtitle: "Employee & designer discounts.\nPlease add products & customer.",
      enabled: shouldEnable(api.cart.subscribable.initial.subtotal, api.cart.subscribable.initial.customer),
      onPress: () => api.action.presentModal()
    });
    api.cart.subscribable.subscribe((cart) => {
      tile.updateProps({ enabled: shouldEnable(cart.subtotal, cart.customer) });
      tile.updateProps({ subtitle: updateInstructionMsg(cart.subtotal, cart.customer) });
    });
    root.append(tile);
    root.mount();
  });

  // extensions/improved-discounts/src/Modal.ts
  var Modal_default = extension("pos.home.modal.render", (root, api) => {
    const checkCustomerPrivilege = (customer, privilegeToCheck) => {
      if (customer.firstName.startsWith(privilegeToCheck)) {
        return true;
      }
      return false;
    };
    const updateDiscounts = (title, maxDiscount) => __async(void 0, null, function* () {
      const items = api.cart.subscribable.initial.lineItems;
      const variantIds = items.map((item) => item.variantId);
      const lineItemIdsQuants = items.map((item) => ({ id: item.uuid, qauntity: item.quantity }));
      const response = yield api.productSearch.fetchProductVariantsWithIds(variantIds);
      const variants = yield response.fetchedResources;
      let LineItemDiscounts = [];
      for (let i = 0; i < variants.length; i++) {
        let fixedDiscountAmount;
        const price = Number(variants[i].price);
        const compAtPrice = Number(variants[i].compareAtPrice);
        const calculatedPrice = compAtPrice * (1 - maxDiscount);
        const lineItemIndex = variantIds.indexOf(variants[i].id);
        const lineItemId = lineItemIdsQuants[lineItemIndex].id;
        const lineItemQuant = lineItemIdsQuants[lineItemIndex].qauntity;
        if (compAtPrice == null || compAtPrice == 0) {
          fixedDiscountAmount = (price * maxDiscount * lineItemQuant).toFixed(2);
        } else if (price > calculatedPrice) {
          fixedDiscountAmount = ((price - calculatedPrice) * lineItemQuant).toFixed(2);
        } else {
          continue;
        }
        const LineItemDiscount = {
          title,
          type: "FixedAmount",
          amount: fixedDiscountAmount,
          test: "hello"
        };
        const SetLineItemDiscountInput = {
          lineItemUuid: String(lineItemId),
          lineItemDiscount: LineItemDiscount
        };
        LineItemDiscounts.push(SetLineItemDiscountInput);
      }
      console.log(LineItemDiscounts);
      try {
        api.cart.bulkSetLineItemDiscounts(LineItemDiscounts);
        api.toast.show("Discount applied.", { duration: 3e3 });
      } catch (err) {
        console.log(err);
      }
    });
    let mainScreen = root.createComponent(Screen, {
      name: "Discounts",
      title: "Available Discounts"
    });
    let scrollView = root.createComponent(ScrollView);
    const designerDiscountBtn = root.createComponent(Button, {
      title: "Designer Discount - 25% off MSRP",
      onPress: () => {
        if (checkCustomerPrivilege(api.cart.subscribable.initial.customer, "DES -") || checkCustomerPrivilege(api.cart.subscribable.initial.customer, "DES-")) {
          updateDiscounts("Designer Discount", 0.25);
        } else {
          api.toast.show("Customer does not have designer privileges.", { duration: 3e3 });
        }
      }
    });
    const employeeDiscountBtn = root.createComponent(Button, {
      title: "Employee Discount - 30% off MSRP",
      onPress: () => {
        if (checkCustomerPrivilege(api.cart.subscribable.initial.customer, "EMP -") || checkCustomerPrivilege(api.cart.subscribable.initial.customer, "EMP-")) {
          updateDiscounts("Employee Discount", 0.3);
        } else {
          api.toast.show("Customer does not have employee privileges.", { duration: 3e3 });
        }
      }
    });
    const buttonStack = root.createComponent(Stack, {
      direction: "block",
      alignContent: "stretch",
      gap: "200"
    });
    scrollView.append(buttonStack);
    buttonStack.append(designerDiscountBtn);
    buttonStack.append(employeeDiscountBtn);
    mainScreen.append(scrollView);
    root.append(mainScreen);
    root.mount();
  });
})();
//# sourceMappingURL=Daniadown-Discounts.js.map
