import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: String,
  logo: String,
  website: String,
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  }
}, {
  timestamps: true
});

// Generate slug before saving
brandSchema.pre('save', function(next) {
  try {
    if (!this.slug && this.name) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('Brand', brandSchema);