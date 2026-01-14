// Theme Toggle Functionality
class ThemeToggle {
  constructor() {
    this.themeToggle = document.getElementById('themeToggle')
    this.themeIcon = this.themeToggle.querySelector('.theme-icon')
    this.currentTheme = localStorage.getItem('theme') || 'light'
    this.init()
  }

  init() {
    // Set initial theme
    this.setTheme(this.currentTheme)

    // Add click event listener
    this.themeToggle.addEventListener('click', () => {
      this.toggleTheme()
    })
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light'
    this.setTheme(this.currentTheme)
    localStorage.setItem('theme', this.currentTheme)
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)

    // Update icon
    if (theme === 'dark') {
      this.themeIcon.textContent = '☀️'
      this.themeToggle.setAttribute('aria-label', 'Switch to light theme')
    } else {
      this.themeIcon.textContent = '🌙'
      this.themeToggle.setAttribute('aria-label', 'Switch to dark theme')
    }
  }
}

// Animated Background
class ParticleBackground {
  constructor() {
    this.canvas = document.querySelector('.bg-canvas')
    if (!this.canvas) return

    this.ctx = this.canvas.getContext('2d')
    this.particles = []
    this.init()
  }

  init() {
    this.resize()
    window.addEventListener('resize', () => this.resize())

    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        color: `rgba(99, 102, 241, ${Math.random() * 0.3 + 0.1})`,
      })
    }

    this.animate()
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.particles.forEach((particle) => {
      particle.x += particle.speedX
      particle.y += particle.speedY

      if (particle.x > this.canvas.width) particle.x = 0
      if (particle.x < 0) particle.x = this.canvas.width
      if (particle.y > this.canvas.height) particle.y = 0
      if (particle.y < 0) particle.y = this.canvas.height

      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      this.ctx.fillStyle = particle.color
      this.ctx.fill()
    })

    requestAnimationFrame(() => this.animate())
  }
}

// Scroll Animations
class ScrollAnimations {
  constructor() {
    this.fadeElements = document.querySelectorAll('.fade-in')
    this.nav = document.getElementById('navbar')
    this.init()
  }

  init() {
    this.checkScroll()
    window.addEventListener('scroll', () => this.checkScroll())
  }

  checkScroll() {
    // Navbar background
    if (window.scrollY > 100) {
      this.nav.classList.add('scrolled')
    } else {
      this.nav.classList.remove('scrolled')
    }

    // Fade in elements
    this.fadeElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top
      const elementVisible = 150

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('visible')
      }
    })
  }
}

// Contact Form Handler
class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm')
    this.status = document.getElementById('formStatus')
    this.init()
  }

  init() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e))
    }
  }

  async handleSubmit(e) {
    e.preventDefault()

    const submitBtn = this.form.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent

    // Show loading state
    submitBtn.disabled = true
    submitBtn.textContent = 'Sending...'
    this.hideStatus()

    try {
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: new FormData(this.form),
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        this.showStatus("Thank you for your message! I'll get back to you soon.", 'success')
        this.form.reset()
      } else {
        throw new Error('Form submission failed')
      }
    } catch (error) {
      this.showStatus(
        'Sorry, there was an error. Please email me directly at hafifahussein5@gmail.com',
        'error',
      )
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = originalText
    }
  }

  showStatus(message, type) {
    this.status.textContent = message
    this.status.className = `form-status ${type}`
    this.status.style.display = 'block'

    setTimeout(() => {
      this.hideStatus()
    }, 5000)
  }

  hideStatus() {
    this.status.style.display = 'none'
  }
}

// Smooth Scrolling
class SmoothScroll {
  constructor() {
    this.init()
  }

  init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault()
        const target = document.querySelector(anchor.getAttribute('href'))
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }
      })
    })
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeToggle()
  new ParticleBackground()
  new ScrollAnimations()
  new ContactForm()
  new SmoothScroll()
})

// Add hover effects to project cards
document.querySelectorAll('.project-card').forEach((card) => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-10px)'
  })

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)'
  })
})
