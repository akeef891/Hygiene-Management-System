import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import Manager from '../models/Manager.js'

const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const existing = await Manager.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'Manager already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const manager = await Manager.create({
      email,
      password: hashedPassword,
    })

    return res.status(201).json({
      message: 'Manager registered successfully',
      managerId: manager._id,
    })
  } catch (error) {
    console.error('Register error', error)
    return res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const manager = await Manager.findOne({ email })
    if (!manager) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, manager.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: manager._id, email: manager.email },
      process.env.JWT_SECRET || 'change_this_secret',
      { expiresIn: '1h' }
    )

    return res.json({ token })
  } catch (error) {
    console.error('Login error', error)
    return res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const manager = await Manager.findOne({ email })

    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')

    manager.resetToken = resetToken
    manager.resetTokenExpire = Date.now() + 3600000

    await manager.save()

    const resetLink = `http://localhost:5500/frontend/reset-password.html?token=${resetToken}`

    const testAccount = await nodemailer.createTestAccount()

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })

    const info = await transporter.sendMail({
      from: '"Hygiene System" <no-reply@hygiene.com>',
      to: email,
      subject: 'Password Reset',
      html: `<p>Click the link to reset your password:</p> <a href="${resetLink}">${resetLink}</a>`,
    })

    console.log('Preview URL:', nodemailer.getTestMessageUrl(info))

    res.json({ message: 'Reset email sent (test mode)' })
  } catch (err) {
    console.error('Forgot password error', err)
    res.status(500).json({ message: err.message })
  }
}

router.post('/forgot-password', forgotPassword)

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' })
    }

    const manager = await Manager.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    })

    if (!manager) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    manager.password = hashedPassword
    manager.resetToken = undefined
    manager.resetTokenExpire = undefined
    await manager.save()

    return res.json({ message: 'Password reset successful' })
  } catch (error) {
    console.error('Reset password error', error)
    return res.status(500).json({ message: 'Server error' })
  }
})

export default router

