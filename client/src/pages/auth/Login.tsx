
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginUser } from '@/services/api'
import { toast } from 'sonner'
import { useSetRecoilState } from 'recoil'
import { userAtom } from '@/store/atoms/userAtom'

const Login = () => {
  const setUser = useSetRecoilState(userAtom);
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })

  const fillSampleData = () => {
    setFormData({ email: 'john.doe@example.com', password: 'Test123!' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginUser(formData)
      .then((response) => {
        const userData = response.data.data?.user;
        if (userData) {
          setUser(userData);
        }
        toast.success('Login successful!')
        navigate('/') 
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Login failed')
      })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
          <Button type="button" variant="outline" size="sm" onClick={fillSampleData}>
            Fill Sample Data
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Sign In
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <button
            onClick={() => navigate('/signup')}
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login