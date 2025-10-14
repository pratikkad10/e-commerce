import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: String,
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  image: String,
  icon: String,
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
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
categorySchema.pre('save', function(next) {
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

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

categorySchema.set('toJSON', { virtuals: true });

export default mongoose.model('Category', categorySchema);