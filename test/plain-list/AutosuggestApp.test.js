import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { expect } from 'chai';
import {
  init,
  eventInstance,
  getInnerHTML,
  expectInputAttribute,
  expectInputValue,
  getSuggestionsContainer,
  getSuggestions,
  getSuggestion,
  expectSuggestions,
  expectFocusedSuggestion,
  mouseEnterSuggestion,
  mouseLeaveSuggestion,
  clickSuggestion,
  focusInput,
  blurInput,
  clickEscape,
  clickEnter,
  clickDown,
  clickUp,
  focusAndSetInputValue
} from '../helpers';
import AutosuggestApp, {
  getSuggestionValue,
  renderSuggestion,
  onChange,
  shouldRenderSuggestions,
  onSuggestionSelected
} from './AutosuggestApp';

describe('Plain list Autosuggest', () => {
  beforeEach(() => {
    const app = TestUtils.renderIntoDocument(React.createElement(AutosuggestApp));
    const container = TestUtils.findRenderedDOMComponentWithClass(app, 'react-autosuggest__container');
    const input = TestUtils.findRenderedDOMComponentWithTag(app, 'input');

    init({ app, container, input });
  });

  describe('initially', () => {
    describe('should render an input and set its:', () => {
      it('id', () => {
        expectInputAttribute('id', 'my-awesome-autosuggest');
      });

      it('placeholder', () => {
        expectInputAttribute('placeholder', 'Type a programming language');
      });

      it('type', () => {
        expectInputAttribute('type', 'search');
      });

      it('value', () => {
        expectInputValue('');
      });
    });

    it('should not show suggestions', () => {
      expectSuggestions([]);
    });
  });

  describe('when typing and matches exist', () => {
    beforeEach(() => {
      focusAndSetInputValue('p');
    });

    it('should show suggestions', () => {
      expectSuggestions(['Perl', 'PHP', 'Python']);
    });

    it('should not focus on any suggestion', () => {
      expectFocusedSuggestion(null);
    });

    it('should hide suggestions when Escape is pressed', () => {
      clickEscape();
      expectSuggestions([]);
    });

    it('should clear the input when Escape is pressed again', () => {
      clickEscape();
      clickEscape();
      expectInputValue('');
    });

    it('should hide suggestions when input is blurred', () => {
      blurInput();
      expectSuggestions([]);
    });

    it('should show suggestions when input is focused again', () => {
      blurInput();
      focusInput();
      expectSuggestions(['Perl', 'PHP', 'Python']);
    });

    it('should revert input value when Escape is pressed after Up/Down interaction', () => {
      clickDown();
      clickEscape();
      expectInputValue('p');
    });

    it('should update input value when suggestion is clicked', () => {
      clickSuggestion(1);
      expectInputValue('PHP');
    });

    it('should focus on suggestion when mouse enters it', () => {
      mouseEnterSuggestion(2);
      expectFocusedSuggestion('Python');
    });

    it('should not have focused suggestions when mouse leaves a suggestion', () => {
      mouseEnterSuggestion(2);
      mouseLeaveSuggestion(2);
      expectFocusedSuggestion(null);
    });
  });

  describe('when typing and matches do not exist', () => {
    beforeEach(() => {
      focusAndSetInputValue('z');
    });

    it('should not show suggestions', () => {
      expectSuggestions([]);
    });

    it('should clear the input when Escape is pressed', () => {
      clickEscape();
      expectInputValue('');
    });
  });

  describe('when pressing Down', () => {
    beforeEach(() => {
      focusAndSetInputValue('p');
    });

    it('should show suggestions with no focused suggestion, if they are hidden', () => {
      clickEscape();
      clickDown();
      expectSuggestions(['Perl', 'PHP', 'Python']);
      expectFocusedSuggestion(null);
    });

    it('should focus on the first suggestion', () => {
      clickDown();
      expectFocusedSuggestion('Perl');
    });

    it('should focus on the next suggestion', () => {
      clickDown(2);
      expectFocusedSuggestion('PHP');
    });

    it('should not focus on any suggestion after reaching the last suggestion', () => {
      clickDown(4);
      expectFocusedSuggestion(null);
    });

    it('should focus on the first suggestion again', () => {
      clickDown(5);
      expectFocusedSuggestion('Perl');
    });
  });

  describe('when pressing Up', () => {
    beforeEach(() => {
      focusAndSetInputValue('p');
    });

    it('should show suggestions with no focused suggestion, if they are hidden', () => {
      clickEscape();
      clickUp();
      expectSuggestions(['Perl', 'PHP', 'Python']);
      expectFocusedSuggestion(null);
    });

    it('should focus on the last suggestion', () => {
      clickUp();
      expectFocusedSuggestion('Python');
    });

    it('should focus on the second last suggestion', () => {
      clickUp(2);
      expectFocusedSuggestion('PHP');
    });

    it('should not focus on any suggestion after reaching the first suggestion', () => {
      clickUp(4);
      expectFocusedSuggestion(null);
    });

    it('should focus on the last suggestion again', () => {
      clickUp(5);
      expectFocusedSuggestion('Python');
    });
  });

  describe('when pressing Enter', () => {
    beforeEach(() => {
      focusAndSetInputValue('p');
    });

    it('should hide suggestions if there is a focused suggestion', () => {
      clickDown();
      clickEnter();
      expectSuggestions([]);
    });

    it('should not hide suggestions if there is no focused suggestion', () => {
      clickEnter();
      expectSuggestions(['Perl', 'PHP', 'Python']);
    });
  });

  describe('when pressing Escape', () => {
    it('should clear the input if suggestions are hidden and never been shown before', () => {
      focusAndSetInputValue('z');
      clickEscape();
      expectInputValue('');
    });

    it('should clear the input if suggestions are hidden but were shown before', () => {
      focusAndSetInputValue('p');
      focusAndSetInputValue('pz');
      clickEscape();
      expectInputValue('');
    });
  });

  describe('when suggestion is clicked', () => {
    beforeEach(() => {
      focusAndSetInputValue('p');
      clickSuggestion(1);
    });

    it('should hide suggestions', () => {
      expectSuggestions([]);
    });
  });

  describe('getSuggestionValue', () => {
    beforeEach(() => {
      getSuggestionValue.reset();
      focusAndSetInputValue('r');
    });

    it('should be called once with the right parameters when Up is pressed', () => {
      clickUp();
      expect(getSuggestionValue).to.have.been.calledOnce;
      expect(getSuggestionValue).to.have.been.calledWithExactly({ name: 'Ruby', year: 1995 });
    });

    it('should be called once with the right parameters when Down is pressed', () => {
      clickDown();
      expect(getSuggestionValue).to.have.been.calledOnce;
      expect(getSuggestionValue).to.have.been.calledWithExactly({ name: 'Ruby', year: 1995 });
    });

    it('should be called once with the right parameters when suggestion is clicked', () => {
      clickSuggestion(0);
      expect(getSuggestionValue).to.have.been.calledOnce;
      expect(getSuggestionValue).to.have.been.calledWithExactly({ name: 'Ruby', year: 1995 });
    });
  });

  describe('renderSuggestion', () => {
    beforeEach(() => {
      renderSuggestion.reset();
      focusAndSetInputValue('r');
    });

    it('should be called with the right parameters', () => {
      expect(renderSuggestion).to.have.been.calledWithExactly({ name: 'Ruby', year: 1995 }, 'r', null);
      renderSuggestion.reset();
      clickDown();
      expect(renderSuggestion).to.have.been.calledWithExactly({ name: 'Ruby', year: 1995 }, 'Ruby', 'r');
    });

    it('should be called once per suggestion', () => {
      expect(renderSuggestion).to.have.been.calledOnce;
    });

    it('return value should be used to render suggestions', () => {
      const firstSuggestion = getSuggestion(0);

      expect(getInnerHTML(firstSuggestion)).to.equal('<strong>R</strong><span>uby</span>');
    });
  });

  describe('inputProps.onChange', () => {
    beforeEach(() => {
      focusAndSetInputValue('c');
      onChange.reset();
    });

    it('should be called once with the right parameters when user types', () => {
      focusAndSetInputValue('c+');
      expect(onChange).to.have.been.calledOnce;
      expect(onChange).to.be.calledWithExactly(eventInstance, {
        newValue: 'c+',
        method: 'type'
      });
    });

    it('should be called once with the right parameters when pressing Down focuses on a suggestion which differs from input value', () => {
      clickDown();
      expect(onChange).to.have.been.calledOnce;
      expect(onChange).to.be.calledWithExactly(eventInstance, {
        newValue: 'C',
        method: 'down'
      });
    });

    it('should be called once with the right parameters when pressing Up focuses on a suggestion which differs from input value', () => {
      clickUp();
      expect(onChange).to.have.been.calledOnce;
      expect(onChange).to.be.calledWithExactly(eventInstance, {
        newValue: 'Clojure',
        method: 'up'
      });
    });

    it('should be called once with the right parameters when Escape is pressed and suggestions are hidden', () => {
      clickEscape();
      clickEscape();
      expect(onChange).to.have.been.calledOnce;
      expect(onChange).to.be.calledWithExactly(eventInstance, {
        newValue: '',
        method: 'escape'
      });
    });

    it('should be called once with the right parameters when suggestion which differs from input value is clicked', () => {
      clickSuggestion(2);
      expect(onChange).to.have.been.calledOnce;
      expect(onChange).to.be.calledWithExactly(eventInstance, {
        newValue: 'C++',
        method: 'click'
      });
    });

    it('should not be called when Down is pressed and suggestions are hidden', () => {
      clickEscape();
      clickDown();
      expect(onChange).not.to.have.been.called;
    });

    it('should not be called when pressing Down focuses on suggestion which value equals to input value', () => {
      focusAndSetInputValue('C++');
      onChange.reset();
      clickDown();
      expect(onChange).not.to.have.been.called;
    });

    it('should not be called when Up is pressed and suggestions are hidden', () => {
      clickEscape();
      clickUp();
      expect(onChange).not.to.have.been.called;
    });

    it('should not be called when pressing Up focuses on suggestion which value equals to input value', () => {
      focusAndSetInputValue('C++');
      onChange.reset();
      clickUp();
      expect(onChange).not.to.have.been.called;
    });

    it('should not be called when Escape is pressed and suggestions are shown', () => {
      clickEscape();
      expect(onChange).not.to.have.been.called;
    });

    it('should not be called when Escape is pressed, suggestions are hidden, and input is empty', () => {
      focusAndSetInputValue('');
      onChange.reset();
      clickEscape();
      expect(onChange).not.to.have.been.called;
    });

    it('should not be called when suggestion which value equals to input value is clicked', () => {
      focusAndSetInputValue('C++');
      onChange.reset();
      clickSuggestion(0);
      expect(onChange).not.to.have.been.called;
    });
  });

  describe('shouldRenderSuggestions', () => {
    beforeEach(() => {
      shouldRenderSuggestions.reset();
    });

    it('should be called with the right parameters', () => {
      focusAndSetInputValue('e');
      expect(shouldRenderSuggestions).to.be.calledWithExactly('e');
    });

    it('should show suggestions when `true` is returned', () => {
      focusAndSetInputValue('e');
      expectSuggestions(['Elm']);
    });

    it('should hide suggestions when `false` is returned', () => {
      focusAndSetInputValue(' e');
      expectSuggestions([]);
    });
  });

  describe('onSuggestionSelected', () => {
    beforeEach(() => {
      onSuggestionSelected.reset();
      focusAndSetInputValue('j');
    });

    it('should be called once with the right parameters when suggestion is clicked', () => {
      clickSuggestion(1);
      expect(onSuggestionSelected).to.have.been.calledOnce;
      expect(onSuggestionSelected).to.have.been.calledWithExactly(eventInstance, {
        suggestion: { name: 'Javascript', year: 1995 },
        suggestionValue: 'Javascript',
        method: 'click'
      });
    });

    it('should be called once with the right parameters when Enter is pressed and suggestion is focused', () => {
      clickDown();
      clickEnter();
      expect(onSuggestionSelected).to.have.been.calledOnce;
      expect(onSuggestionSelected).to.have.been.calledWithExactly(eventInstance, {
        suggestion: { name: 'Java', year: 1995 },
        suggestionValue: 'Java',
        method: 'enter'
      });
    });

    it('should not be called when Enter is pressed and there is no focused suggestion', () => {
      clickEnter();
      expect(onSuggestionSelected).not.to.have.been.called;
    });

    it('should not be called when Enter is pressed and there is no focused suggestion after Up/Down interaction', () => {
      clickDown();
      clickDown();
      clickDown();
      clickEnter();
      expect(onSuggestionSelected).not.to.have.been.called;
    });
  });

  describe('aria attributes', () => {
    describe('initially', () => {
      describe('should set input\'s', () => {
        it('role to "combobox"', () => {
          expectInputAttribute('role', 'combobox');
        });

        it('aria-autocomplete to "list"', () => {
          expectInputAttribute('aria-autocomplete', 'list');
        });

        it('aria-expanded to "false"', () => {
          expectInputAttribute('aria-expanded', 'false');
        });

        it('aria-owns', () => {
          expectInputAttribute('aria-owns', 'react-whatever-1');
        });
      });

      describe('should not set input\'s', () => {
        it('aria-activedescendant', () => {
          expectInputAttribute('aria-activedescendant', null);
        });
      });
    });

    describe('when suggestions are shown', () => {
      beforeEach(() => {
        focusAndSetInputValue('J');
      });

      it('input\'s aria-expanded should be "true"', () => {
        expectInputAttribute('aria-expanded', 'true');
      });

      it('input\'s aria-owns should be equal to suggestions container id', () => {
        expectInputAttribute('aria-owns', getSuggestionsContainer().id);
      });

      it('input\'s aria-activedescendant should be equal to the focused suggestion id when using keyboard', () => {
        clickDown();
        expectInputAttribute('aria-activedescendant', getSuggestion(0).id);
        clickDown();
        expectInputAttribute('aria-activedescendant', getSuggestion(1).id);
        clickDown();
        expectInputAttribute('aria-activedescendant', null);
      });

      it('input\'s aria-activedescendant should be equal to the focused suggestion id when using mouse', () => {
        mouseEnterSuggestion(0);
        expectInputAttribute('aria-activedescendant', getSuggestion(0).id);
        mouseLeaveSuggestion(0);
        expectInputAttribute('aria-activedescendant', null);
      });

      it('suggestions container role should be "listbox"', () => {
        expect(getSuggestionsContainer().getAttribute('role')).to.equal('listbox');
      });

      it('suggestions\' role should be "option"', () => {
        expect(getSuggestion(0).getAttribute('role')).to.equal('option');
        expect(getSuggestion(1).getAttribute('role')).to.equal('option');
      });
    });
  });
});