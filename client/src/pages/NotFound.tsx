import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-primary">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate('/')}
            size="lg"
          >
            Go Home
          </Button>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
