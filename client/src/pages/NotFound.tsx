import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container max-w-3xl mx-auto py-20 px-4">
      <div className="flex flex-col items-center space-y-8 text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-4xl font-bold">Page Not Found</h2>
        <p className="text-lg text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div>
          <Link 
            to="/"
            className="btn btn-primary px-6 py-3 text-lg"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
