var PropTypes = require('prop-types');
var React         = require('react');
var createReactClass = require('create-react-class');
var ReactDOM      = require('react-dom');
var classnames   = require('classnames');

var Autocomplete = createReactClass({
  displayName: 'Autocomplete',

  propTypes: {
    options: PropTypes.any,
    search: PropTypes.func,
    resultRenderer: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func
    ]),
    value: PropTypes.object,
    onChange: PropTypes.func,
    onError: PropTypes.func,
    onFocus: PropTypes.func
  },

  getDefaultProps: function() {
    return {search: searchArray};
  },

  getInitialState: function() {
    var searchTerm = this.props.searchTerm ?
      this.props.searchTerm :
      this.props.value ?
      this.props.value.title :
      '';
    return {
      results: [],
      showResults: false,
      showResultsInProgress: false,
      searchTerm: searchTerm,
      focusedValue: null
    };
  },

  getResultIdentifier : function(result){
    if(this.props.resultIdentifier === undefined){
      return result.id;
    }else{
      return result[this.props.resultIdentifier];
    }
  },

  render: function() {
    var className = classnames(
      this.props.className,
      'react-autocomplete-Autocomplete',
      this.state.showResults ?
        'react-autocomplete-Autocomplete--resultsShown' :
        undefined
    );
    var style = {
      position: 'relative',
      outline: 'none'
    };
    return (
      <div
        tabIndex="1"
        className={className}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        style={style}>
        <input
          ref="search"
          className="react-autocomplete-Autocomplete__search"
          style={{width: '100%'}}
          onClick={this.showAllResults}
          onChange={this.onQueryChange}
          onFocus={this.onSearchInputFocus}
          onBlur={this.onQueryBlur}
          onKeyDown={this.onQueryKeyDown}
          value={this.state.searchTerm}
          />
        <Results
          className="react-autocomplete-Autocomplete__results"
          onSelect={this.onValueChange}
          onFocus={this.onValueFocus}
          results={this.state.results}
          focusedValue={this.state.focusedValue}
          show={this.state.showResults}
          renderer={this.props.resultRenderer}
          label={this.props.label}
          resultIdentifier={this.props.resultIdentifier}
          />
      </div>
    );
  },

  componentWillReceiveProps: function(nextProps) {
    var searchTerm = nextProps.searchTerm ?
      nextProps.searchTerm :
      nextProps.value ?
      nextProps.value.title :
      '';
    this.setState({searchTerm: searchTerm});
  },

  componentWillMount: function() {
    this.blurTimer = null;
  },

  /**
    * Show results for a search term value.
    *
    * This method doesn't update search term value itself.
    *
    * @param {Search} searchTerm
    */
  showResults: function(searchTerm) {
    this.setState({showResultsInProgress: true});
    this.props.search(
      this.props.options,
      searchTerm.trim(),
      this.onSearchComplete
    );
  },

  showAllResults: function() {
    if (!this.state.showResultsInProgress && !this.state.showResults) {
      this.showResults('');
    }
  },

  onValueChange: function(value) {
    var state = {
      value: value,
      showResults: false
    };

    if (value) {
      state.searchTerm = value.title;
    }

    this.setState(state);

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  },

  onSearchComplete: function(err, results) {
    if (err) {
      if (this.props.onError) {
        this.props.onError(err);
      } else {
        throw err;
      }
    }

    this.setState({
      showResultsInProgress: false,
      showResults: true,
      results: results
    });
  },

  onValueFocus: function(value) {
    this.setState({focusedValue: value});
  },

  onQueryChange: function(e) {
    var searchTerm = e.target.value;
    this.setState({
      searchTerm: searchTerm,
      focusedValue: null
    });
    this.showResults(searchTerm);
  },

  onFocus: function() {
    if (this.blurTimer) {
      clearTimeout(this.blurTimer);
      this.blurTimer = null;
    }
    this.refs.search.focus();
  },

  onSearchInputFocus: function() {
    if (this.props.onFocus) {
      this.props.onFocus();
    }

    this.showAllResults();
  },

  onBlur: function() {
    // wrap in setTimeout so we can catch a click on results
    this.blurTimer = setTimeout(() => {
        this.setState({showResults: false});
    }, 100);
  },

  onQueryKeyDown: function(e) {

    if (e.key === 'Enter') {
      e.preventDefault();
      if (this.state.focusedValue) {
        this.onValueChange(this.state.focusedValue);
      }

    } else if (e.key === 'ArrowUp' && this.state.showResults) {
      e.preventDefault();
      var prevIdx = Math.max(
        this.focusedValueIndex() - 1,
        0
      );
      this.setState({
        focusedValue: this.state.results[prevIdx]
      });

    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.state.showResults) {
        var nextIdx = Math.min(
          this.focusedValueIndex() + (this.state.showResults ? 1 : 0),
          this.state.results.length - 1
        );
        this.setState({
          showResults: true,
          focusedValue: this.state.results[nextIdx]
        });
      } else {
        this.showAllResults();
      }
    }
  },

  focusedValueIndex: function() {
    if (!this.state.focusedValue) {
      return -1;
    }
    for (var i = 0, len = this.state.results.length; i < len; i++) {
      if (this.getResultIdentifier(this.state.results[i]) === this.getResultIdentifier(this.state.focusedValue)) {
        return i;
      }
    }
    return -1;
  },
});

class Results extends React.Component {
  getResultIdentifier = (result) => {
    if(this.props.resultIdentifier === undefined){
      if(!result.id){
        throw Error("id property not found on result. You must specify a resultIdentifier and pass as props to autocomplete component");
      }
      return result.id;
    }else{
      return result[this.props.resultIdentifier];
    }
  };

  render() {
    var style = {
      display: this.props.show ? 'block' : 'none',
      position: 'absolute',
      listStyleType: 'none'
    };
    var { className } = this.props;

    return (
      <ul style={style} className={className + " react-autocomplete-Results"}>
        {this.props.results.map(this.renderResult)}
      </ul>
    );
  }

  renderResult = (result) => {
    var focused = this.props.focusedValue && this.getResultIdentifier(this.props.focusedValue) === this.getResultIdentifier(result);
    var Renderer = this.props.renderer || Result;
    return (<Renderer
      ref={focused ? "focused" : undefined}
      key={this.getResultIdentifier(result)}
      result={result}
      focused={focused}
      onMouseEnter={this.onMouseEnterResult}
      onClick={this.props.onSelect}
      label={this.props.label}/>);
  };

  componentDidUpdate() {
    this.scrollToFocused();
  }

  componentDidMount() {
    this.scrollToFocused();
  }

  componentWillMount() {
    this.ignoreFocus = false;
  }

  scrollToFocused = () => {
    var focused = this.refs && this.refs.focused;
    if (focused) {
      var containerNode = ReactDOM.findDOMNode(this);
      var scroll = containerNode.scrollTop;
      var height = containerNode.offsetHeight;

      var node = ReactDOM.findDOMNode(focused);
      var top = node.offsetTop;
      var bottom = top + node.offsetHeight;

      // we update ignoreFocus to true if we change the scroll position so
      // the mouseover event triggered because of that won't have an
      // effect
      if (top < scroll) {
        this.ignoreFocus = true;
        containerNode.scrollTop = top;
      } else if (bottom - scroll > height) {
        this.ignoreFocus = true;
        containerNode.scrollTop = bottom - height;
      }
    }
  };

  onMouseEnterResult = (e, result) => {
    // check if we need to prevent the next onFocus event because it was
    // probably caused by a mouseover due to scroll position change
    if (this.ignoreFocus) {
      this.ignoreFocus = false;
    } else {
      // we need to make sure focused node is visible
      // for some reason mouse events fire on visible nodes due to
      // box-shadow
      var containerNode = ReactDOM.findDOMNode(this);
      var scroll = containerNode.scrollTop;
      var height = containerNode.offsetHeight;

      var node = e.target;
      var top = node.offsetTop;
      var bottom = top + node.offsetHeight;

      if (bottom > scroll && top < scroll + height) {
        this.props.onFocus(result);
      }
    }
  };
}

class Result extends React.Component {
  static defaultProps = {
    label : function(result){
      return result.title;
    }
  };

  getLabel = (result) => {
    if(typeof this.props.label === 'function'){
      return this.props.label(result);
    }else if(typeof this.props.label === 'string'){
      return result[this.props.label];
    }
  };

  render() {
    var className = classnames({
      'react-autocomplete-Result': true,
      'react-autocomplete-Result--active': this.props.focused
    });

    return (
      <li
        style={{listStyleType: 'none'}}
        className={className}
        onClick={this.onClick}
        onMouseEnter={this.onMouseEnter}>
        <a>{this.getLabel(this.props.result)}</a>
      </li>
    );
  }

  onClick = () => {
    this.props.onClick(this.props.result);
  };

  onMouseEnter = (e) => {
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(e, this.props.result);
    }
  };

  shouldComponentUpdate(nextProps) {
    return (nextProps.result.id !== this.props.result.id ||
            nextProps.focused !== this.props.focused);
  }
}

/**
* Search options using specified search term treating options as an array
* of candidates.
*
* @param {Array.<Object>} options
* @param {String} searchTerm
* @param {Callback} cb
*/
function searchArray(options, searchTerm, cb) {
  if (!options) {
    return cb(null, []);
  }

  searchTerm = new RegExp(searchTerm, 'i');

  var results = [];

  for (var i = 0, len = options.length; i < len; i++) {
    if (searchTerm.exec(options[i].title)) {
      results.push(options[i]);
    }
  }

  cb(null, results);
}

module.exports = Autocomplete;
