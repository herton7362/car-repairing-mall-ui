import React from 'react';

export default class App extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            title: 'app'
        };
    }

    render () {
        return (
      <div className="container">
          {this.props && this.props.children && React.cloneElement(this.props.children, {
              changeTitle: title => this.setState({ title })
          })}
      </div>
        );
    }
}
