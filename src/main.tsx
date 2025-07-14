import 'preact-in-motion'
import { navigate } from './navigate'
import './styles/main.css'

navigate(new URL(location.href))
