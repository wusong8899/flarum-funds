import LoadingIndicator from 'flarum/common/components/LoadingIndicator';

interface LoadingStateProps {
  className?: string;
}

export default function LoadingState(props: LoadingStateProps): JSX.Element {
  const { className = '' } = props;
  
  return (
    <div className={`WithdrawalPage-loading ${className}`}>
      <LoadingIndicator />
    </div>
  );
}