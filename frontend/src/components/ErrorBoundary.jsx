import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__card">
            <h1>Something went wrong</h1>
            <p>An unexpected error occurred. Please try again.</p>
            {this.state.error && (
              <details className="error-boundary__details">
                <summary>Technical details</summary>
                <pre>{String(this.state.error)}</pre>
              </details>
            )}
            <div className="error-boundary__actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleReset}
              >
                Try again
              </button>
              <button
                type="button"
                className="btn"
                onClick={this.handleReload}
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
