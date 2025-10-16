import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signupUser } from '@/services/api'
import { toast } from 'sonner'

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    storeName: ''
  })
  const [error, setError] = useState('')

  const fillSampleData = () => {
    setFormData({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Test123!',
      phone: '+1234567890',
      role: 'customer',
      storeName: ''
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      ...(formData.phone && { phone: formData.phone }),
      role: formData.role,
      ...(formData.role === 'seller' && formData.storeName && { storeName: formData.storeName })
    }
    
    signupUser(payload)
      .then((response) => {
        console.log('Signup successful:', response.data)
        toast.success('Signup successful! Please log in.')
        navigate('/login')
      })
      .catch((error) => {
        setError(error.response?.data?.message || 'Signup failed')
      })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground/90">Create Account</h1>
          <p className="text-muted-foreground">Sign up to get started</p>
          <Button type="button" variant="outline" size="sm" onClick={fillSampleData}>
            Fill Sample Data
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  First Name
                </label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

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
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-foreground">
                Role
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            {formData.role === 'seller' && (
              <div className="space-y-2">
                <label htmlFor="storeName" className="text-sm font-medium text-foreground">
                  Store Name
                </label>
                <Input
                  id="storeName"
                  placeholder="My Store"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  required
                />
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg">
            Sign Up
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <button
            onClick={() => navigate('/login')}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}

export default Signup