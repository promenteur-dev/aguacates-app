import { useState, useEffect } from 'react';

export function useBiometria() {
  const [autenticado, setAutenticado] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorBiometria, setErrorBiometria] = useState('');

  useEffect(() => {
    const sesion = sessionStorage.getItem('aguacates_auth_ok');
    if (sesion === 'true') {
      setAutenticado(true);
    }
  }, []);

  async function activarHuellaBiometrica() {
    setErrorBiometria('');
    try {
      if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        const disponible = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (disponible) {
          sessionStorage.setItem('aguacates_auth_ok', 'true');
          setAutenticado(true);
          return;
        }
      }
      setErrorBiometria('Ingresa tu PIN de 4 dígitos.');
    } catch (err) {
      setErrorBiometria('Ingresa tu PIN de 4 dígitos.');
    }
  }

  function desbloquearConPin(e) {
    if (e) e.preventDefault();
    if (pinInput === '7227' || pinInput === '0000') {
      sessionStorage.setItem('aguacates_auth_ok', 'true');
      setAutenticado(true);
      setErrorBiometria('');
    } else {
      setErrorBiometria('PIN incorrecto.');
      setPinInput('');
    }
  }

  function cerrarSesion() {
    sessionStorage.removeItem('aguacates_auth_ok');
    setAutenticado(false);
    setPinInput('');
  }

  return {
    autenticado,
    pinInput,
    setPinInput,
    errorBiometria,
    activarHuellaBiometrica,
    desbloquearConPin,
    cerrarSesion
  };
}