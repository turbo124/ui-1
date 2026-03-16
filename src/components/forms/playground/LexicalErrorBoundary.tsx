import { Component, ErrorInfo, ReactNode, useState } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export function LexicalErrorBoundary({ children }: Props) {
    const [error, setError] = useState<Error | null>(null);

    if (error) {
        return (
            <div className="error-boundary">
                <h2>Something went wrong.</h2>
                <details className="error-details">
                    <summary>Click for error details</summary>
                    <pre className="error-stack">{error.stack}</pre>
                </details>
            </div>
        );
    }

    return <>{children}</>;
}

class LexicalErrorBoundaryClass extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h2>Something went wrong.</h2>
                    <details className="error-details">
                        <summary>Click for error details</summary>
                        <pre className="error-stack">
                            {this.state.error?.stack}
                        </pre>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export { LexicalErrorBoundaryClass };
export default LexicalErrorBoundary;
