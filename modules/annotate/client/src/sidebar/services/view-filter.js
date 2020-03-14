/*
 * Copyright 2019 European Commission
 *
 * Licensed under the EUPL, Version 1.2 or – as soon they will be approved by the European Commission - subsequent versions of the EUPL (the "Licence");
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 *     https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and limitations under the Licence.
 */
'use strict';

// Prevent Babel inserting helper code after `@ngInject` comment below which
// breaks browserify-ngannotate.
var unused; // eslint-disable-line

// @ngInject
function viewFilter(unicode) {
  /**
   * Normalize a field value or query term for comparison.
   */
  function normalize(val) {
    if (typeof val !== 'string') {
      return val;
    }
    return unicode.fold(unicode.normalize(val)).toLowerCase();
  }

  /**
   * Filter that matches annotations against a single field & term.
   *
   * eg. "quote:foo" or "text:bar"
   */
  class TermFilter {
    /**
     * @param {string} field - Name of field to match
     * @param {string} term - Query term
     * @param {Checker} checker - Functions for extracting term values from
     *   an annotation and checking whether they match a query term.
     */
    constructor(field, term, checker) {
      this.field = field;
      this.term = term;
      this.checker = checker;
    }

    matches(ann) {
      var checker = this.checker;
      if (checker.autofalse && checker.autofalse(ann)) {
        return false;
      }

      var value = checker.value(ann);
      if (Array.isArray(value)) {
        value = value.map(normalize);
      } else {
        value = normalize(value);
      }
      return checker.match(this.term, value);
    }
  }

  /**
   * Filter that combines other filters using AND or OR combinators.
   */
  class BinaryOpFilter {
    /**
     * @param {'and'|'or'} op - Binary operator
     * @param {Filter[]} - Array of filters to test against
     */
    constructor(op, filters) {
      this.operator = op;
      this.filters = filters;
    }

    matches(ann) {
      if (this.operator === 'and') {
        return this.filters.every(filter => filter.matches(ann));
      } else {
        return this.filters.some(filter => filter.matches(ann));
      }
    }
  }

  /**
   * Functions for extracting field values from annotations and testing whether
   * they match a query term.
   *
   * [facet_name]:
   *   autofalse: a function for a preliminary false match result
   *   value: a function to extract to facet value for the annotation.
   *   match: a function to check if the extracted value matches the facet value
   */
  this.fields = {
    quote: {
      autofalse: ann => (ann.references || []).length > 0,
      value(annotation) {
        if (!annotation.target) {
          // FIXME: All annotations *must* have a target, so this check should
          // not be required.
          return '';
        }
        var target = annotation.target[0];
        var selectors = target.selector || [];

        return selectors
          .filter(s => s.type === 'TextQuoteSelector')
          .map(s => s.exact)
          .join('\n');
      },
      match: (term, value) => value.indexOf(term) > -1,
    },
    since: {
      autofalse: ann => typeof ann.updated !== 'string',
      value: ann => new Date(ann.updated),
      match(term, value) {
        var delta = (Date.now() - value) / 1000;
        return delta <= term;
      },
    },
    tag: {
      autofalse: ann => !Array.isArray(ann.tags),
      value: ann => ann.tags,
      match: (term, value) => value.includes(term),
    },
    text: {
      autofalse: ann => typeof ann.text !== 'string',
      value: ann => ann.text,
      match: (term, value) => value.indexOf(term) > -1,
    },
    uri: {
      autofalse: ann => typeof ann.uri !== 'string',
      value: ann => ann.uri,
      match: (term, value) => value.indexOf(term) > -1,
    },
    user: {
      autofalse: ann => typeof ann.user !== 'string',
      value: ann => ann.user,
      match: (term, value) => value.indexOf(term) > -1,
    },

    //LEOS changes as we need to search for DG/Entity
    user_entity: {
        autofalse: ann => typeof ann.user_info !== 'object' || typeof ann.user_info.entity_name !== 'string',
        value: ann => ann.user_info.entity_name,
        match: (term, value) => value.indexOf(term) > -1,
    },

    //LEOS changes as we may need to search for user's full name
    user_name: {
        autofalse: ann => typeof ann.user_info !== 'object' || typeof ann.user_info.display_name !== 'string',
        value: ann => ann.user_info.display_name,
        match: (term, value) => value.indexOf(term) > -1,
    },

    responseVersion: {
      autofalse: ann => typeof ann.document.metadata !== 'object' || typeof ann.document.metadata["responseVersion"] !== 'string',
      value: ann => ann.document.metadata["responseVersion"],
      match: (term, value) => value.indexOf(term) > -1,
    },

    ISCReference: {
      autofalse: ann => typeof ann.document.metadata !== 'object' || typeof ann.document.metadata["ISCReference"] !== 'string',
      value: ann => ann.document.metadata["ISCReference"],
      match: (term, value) => value.indexOf(term) > -1,
    },

    responseId: {
      autofalse: ann => typeof ann.document.metadata !== 'object' || typeof ann.document.metadata["responseId"] !== 'string',
      value: ann => ann.document.metadata["responseId"],
      match: (term, value) => value.indexOf(term) > -1,
    }

  };

  /**
   * Filters a set of annotations.
   *
   * @param {Annotation[]} annotations
   * @param {Object} filters - Faceted filter generated by
   * `generateFacetedFilter`.
   * @return {string[]} IDs of matching annotations.
   */
  this.filter = (annotations, filters) => {
    // Convert the input filter object into a filter tree, expanding "any"
    // filters.
    var fieldFilters = Object.entries(filters).filter(([, filter]) =>
      filter.terms.length > 0)
    .map(([field, filter]) => {
      var terms = filter.terms.map(normalize);
      var termFilters;
      if (field === 'any') {
        //LEOS changes as we may need to search for user's DG/Entity and full name
        var anyFields = ['quote', 'text', 'tag', 'user', 'user_entity', 'user_name','responseVersion','ISCReference','responseId'];
        termFilters = terms.map(term => new BinaryOpFilter('or', anyFields.map(field =>
          new TermFilter(field, term, this.fields[field])
        )));
      } else {
        termFilters = terms.map(term => new TermFilter(field, term, this.fields[field]));
      }
      return new BinaryOpFilter(filter.operator, termFilters);
    });

    var rootFilter = new BinaryOpFilter('and', fieldFilters);

    return annotations
      .filter(ann => rootFilter.matches(ann))
      .map(ann => ann.id);
  };
}

module.exports = viewFilter;
