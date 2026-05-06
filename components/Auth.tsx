
import React, { useState, useRef, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, ChevronLeft, CheckCircle, Briefcase, KeyRound, ShieldCheck, Eye, EyeOff, Check, X, AlertCircle, AlertTriangle } from 'lucide-react';
import { MOCK_USERS } from '../services/mockData';
import { UserProfile, UserRole } from '../types';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

type AuthView = 'login' | 'register' | 'forgot';
type ForgotStep = 'email' | 'otp' | 'reset' | 'success';

// Simple SVG Icons for Google and Apple
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.52 12.29C23.52 11.43 23.47 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.25 17.21 15.82 18.16V21.16H19.68C21.94 19.11 23.52 16.12 23.52 12.29Z" fill="#4285F4"/>
    <path d="M12 24C15.24 24 17.96 22.93 19.96 21.09L16.13 18.16C15.04 18.88 13.63 19.35 12 19.35C8.85 19.35 6.18 17.26 5.23 14.45H1.24V17.51C3.21 21.41 7.34 24 12 24Z" fill="#34A853"/>
    <path d="M5.23 14.45C4.99 13.58 4.87 12.8 4.87 12C4.87 11.2 4.99 10.42 5.23 9.55V6.49H1.24C0.45 8.1 0 9.99 0 12C0 14.01 0.45 15.9 1.24 17.51L5.23 14.45Z" fill="#FBBC05"/>
    <path d="M12 4.65C13.82 4.65 15.39 5.27 16.66 6.46L20.06 3.06C17.95 1.13 15.24 0 12 0C7.34 0 3.21 2.59 1.24 6.49L5.23 9.55C6.18 6.74 8.85 4.65 12 4.65Z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28C15.77 22.09 14.28 22.07 12.86 22.07C11.39 22.07 10.95 21.24 9.25 21.24C7.54 21.24 7.02 22.04 5.68 22.07C4.31 22.09 2.19 19.72 1.05 18.06C-1.35 14.62 0.38 8.89 4.38 8.7C6.01 8.64 7.27 9.8 8.27 9.8C9.25 9.8 10.92 8.44 12.72 8.64C13.47 8.68 15.58 8.95 16.92 10.92C16.82 10.98 14.9 12.1 14.92 14.65C14.95 17.47 17.42 18.43 17.5 18.47C17.46 18.63 17.3 19.26 17.05 20.28ZM12.03 5.86C12.74 4.97 13.22 3.73 13.08 2.51C11.96 2.56 10.61 3.26 9.81 4.19C9.09 5.03 8.52 6.32 8.71 7.51C9.92 7.6 11.27 6.8 12.03 5.86Z"/>
  </svg>
);

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
  const [resetEmail, setResetEmail] = useState('');
  
  // OTP State
  const [otpCode, setOtpCode] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Clear errors when switching views
  useEffect(() => {
    setError(null);
    setLoginEmail('');
    setLoginPassword('');
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
  }, [view]);

  // Password Strength Criteria
  const passwordCriteria = {
    length: registerPassword.length >= 8,
    hasLower: /[a-z]/.test(registerPassword),
    hasUpper: /[A-Z]/.test(registerPassword),
    hasNumber: /[0-9]/.test(registerPassword),
  };
  
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- LOGIN LOGIC ---
    if (view === 'login') {
      if (!loginEmail || !loginPassword) {
        setError('Vui lòng nhập email và mật khẩu.');
        return;
      }

      if (!validateEmail(loginEmail)) {
        setError('Định dạng email không hợp lệ (ví dụ: user@example.com).');
        return;
      }

      // Simulate backend check against Mock Data
      const existingUser = MOCK_USERS.find(u => u.email === loginEmail);
      if (!existingUser) {
        setError('Email này chưa được đăng ký trong hệ thống.');
        return;
      }

      // Simulate password check (Mock: for demo, reject if password length < 6)
      if (loginPassword.length < 6) {
        setError('Mật khẩu không chính xác. Vui lòng thử lại.');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        // Use the found mock user or fallback based on role selector for demo purposes
        const mockUser = MOCK_USERS.find(u => u.role === selectedRole) || MOCK_USERS[0];
        onLogin(mockUser);
      }, 800);
    } 
    
    // --- REGISTER LOGIC ---
    else if (view === 'register') {
      if (!registerName || !registerEmail || !registerPassword) {
        setError('Vui lòng điền đầy đủ thông tin.');
        return;
      }

      if (!validateEmail(registerEmail)) {
        setError('Định dạng email không hợp lệ.');
        return;
      }

      // Check duplications
      const isDuplicate = MOCK_USERS.some(u => u.email === registerEmail);
      if (isDuplicate) {
        setError('Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.');
        return;
      }

      if (!isPasswordValid) {
        setError("Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra lại yêu cầu bên dưới.");
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        // Login as new user (mock)
        const newUser: UserProfile = {
            id: `u-${Date.now()}`,
            name: registerName,
            email: registerEmail,
            role: selectedRole,
            avatar: `https://ui-avatars.com/api/?name=${registerName}&background=random`,
            assignedShopIds: []
        };
        onLogin(newUser);
      }, 1000);
    }
  };

  const handleSocialLogin = (platform: 'Google' | 'Apple') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const mockUser = MOCK_USERS[0]; 
      onLogin(mockUser);
    }, 1000);
  };

  // --- Forgot Password Handlers ---

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if(!validateEmail(resetEmail)) {
        setError('Vui lòng nhập địa chỉ email hợp lệ.');
        return;
    }

    // Check if email exists
    const userExists = MOCK_USERS.find(u => u.email === resetEmail);
    if (!userExists) {
        setError('Email không tồn tại trong hệ thống.');
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotStep('otp');
    }, 1000);
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const val = element.value;
    if (isNaN(Number(val))) return; 

    const newOtp = [...otpCode];
    newOtp[index] = val.substring(val.length - 1); 
    setOtpCode(newOtp);

    if (val && index < 5) {
        inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
        if (!otpCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, '').slice(0, 6).split("");
    const newOtp = [...otpCode];
    pastedData.forEach((val, i) => {
        if (i < 6) newOtp[i] = val;
    });
    setOtpCode(newOtp);
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otpCode.join("");
    if(code.length !== 6) {
        setError("Vui lòng nhập đủ 6 số xác nhận");
        return;
    }
    // Mock OTP check
    if (code === '000000') {
        setError("Mã xác nhận không chính xác.");
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotStep('reset');
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if(newPassword.length < 6) {
        setError("Mật khẩu mới quá ngắn (tối thiểu 6 ký tự).");
        return;
    }
    if(newPassword !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp!");
        return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotStep('success');
    }, 1000);
  };

  const resetForgotState = () => {
      setView('login');
      setForgotStep('email');
      setResetEmail('');
      setOtpCode(new Array(6).fill(""));
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
  };

  const renderError = () => (
    error ? (
      <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in mb-4">
        <AlertTriangle size={18} className="shrink-0" />
        <span>{error}</span>
      </div>
    ) : null
  );

  const renderForgotPassword = () => (
    <div className="p-8">
      {forgotStep === 'email' && (
        <div className="animate-fade-in">
            <button 
                onClick={resetForgotState}
                className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 text-sm mb-6 transition-colors"
            >
                <ChevronLeft size={16} /> Quay lại đăng nhập
            </button>

            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <KeyRound size={24} />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">Quên mật khẩu?</h2>
            <p className="text-slate-500 text-sm mb-8">Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã xác nhận.</p>

            <form onSubmit={handleSendOtp} className="space-y-4">
                {renderError()}
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                    type="email" 
                    value={resetEmail}
                    onChange={(e) => { setResetEmail(e.target.value); setError(null); }}
                    placeholder="Email của bạn"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:bg-indigo-400"
                >
                    {isLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                </button>
            </form>
        </div>
      )}

      {forgotStep === 'otp' && (
        <div className="animate-fade-in">
            <button 
                onClick={() => setForgotStep('email')}
                className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 text-sm mb-6 transition-colors"
            >
                <ChevronLeft size={16} /> Quay lại
            </button>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">Nhập mã xác nhận</h2>
            <p className="text-slate-500 text-sm mb-8">Mã gồm 6 số đã được gửi đến email <span className="font-bold text-slate-700">{resetEmail}</span></p>

            <form onSubmit={handleVerifyOtp} className="space-y-8">
                {renderError()}
                <div className="flex gap-3 justify-center">
                    {otpCode.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => { handleOtpChange(e.target, index); setError(null); }}
                            onKeyDown={e => handleOtpKeyDown(e, index)}
                            onPaste={handleOtpPaste}
                            className={`w-12 h-14 text-center text-2xl font-bold bg-white border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all ${digit ? 'border-indigo-500 text-indigo-600' : 'border-slate-200 text-slate-700'}`}
                            autoFocus={index === 0}
                        />
                    ))}
                </div>
                
                <div className="text-center text-xs text-slate-400">
                    Chưa nhận được mã? <button type="button" className="text-indigo-600 font-bold hover:underline" onClick={() => alert("Đã gửi lại mã!")}>Gửi lại</button>
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:bg-indigo-400"
                >
                    {isLoading ? 'Đang xác thực...' : 'Xác thực'}
                </button>
            </form>
        </div>
      )}

      {forgotStep === 'reset' && (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Đặt lại mật khẩu</h2>
            <p className="text-slate-500 text-sm mb-6">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>

            <form onSubmit={handleResetPassword} className="space-y-4">
                {renderError()}
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                        placeholder="Mật khẩu mới"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        required
                        minLength={6}
                    />
                </div>
                <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                        placeholder="Xác nhận mật khẩu mới"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        required
                        minLength={6}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:bg-indigo-400"
                >
                    {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
            </form>
        </div>
      )}

      {forgotStep === 'success' && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center animate-fade-in mt-10">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={24} />
          </div>
          <h3 className="font-semibold text-slate-800 mb-1 text-lg">Thành công!</h3>
          <p className="text-sm text-slate-600 mb-6">Mật khẩu của bạn đã được thay đổi. Hãy đăng nhập lại với mật khẩu mới.</p>
          <button 
             onClick={resetForgotState}
             className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg shadow-sm transition-colors"
          >
            Về trang đăng nhập
          </button>
        </div>
      )}
    </div>
  );

  const CriteriaItem = ({ valid, text }: { valid: boolean, text: string }) => (
    <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${valid ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${valid ? 'bg-green-100 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
        {valid && <Check size={10} />}
      </div>
      {text}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {view !== 'forgot' && (
          <div className="bg-indigo-600 p-8 text-center">
             <h1 className="text-3xl font-bold text-white mb-2">OmniSales</h1>
             <p className="text-indigo-100 text-sm">Quản lý bán hàng đa kênh thông minh</p>
          </div>
        )}
        
        {view === 'forgot' ? (
          renderForgotPassword()
        ) : (
          <div className="p-8">
            {/* View Switcher */}
            <div className="flex gap-4 mb-8 bg-slate-50 p-1 rounded-lg">
              <button 
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${view === 'login' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setView('login')}
              >
                Đăng nhập
              </button>
              <button 
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${view === 'register' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setView('register')}
              >
                Đăng ký
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {renderError()}

              {view === 'register' && (
                <div className="relative animate-fade-in">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Họ tên đầy đủ"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={view === 'login' ? loginEmail : registerEmail}
                  onChange={(e) => { 
                      const val = e.target.value; 
                      view === 'login' ? setLoginEmail(val) : setRegisterEmail(val); 
                      setError(null);
                  }}
                  placeholder="Email của bạn"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mật khẩu"
                  className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    view === 'register' && !isPasswordValid && registerPassword.length > 0 
                    ? 'border-red-300 focus:ring-red-200' 
                    : 'border-slate-200 focus:ring-indigo-500'
                  }`}
                  value={view === 'register' ? registerPassword : loginPassword}
                  onChange={(e) => {
                      const val = e.target.value;
                      view === 'register' ? setRegisterPassword(val) : setLoginPassword(val);
                      setError(null);
                  }}
                  onFocus={() => setIsPasswordFocused(true)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Meter (Register Only) */}
              {view === 'register' && (isPasswordFocused || registerPassword.length > 0) && (
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 animate-fade-in space-y-2">
                   <p className="text-xs font-semibold text-slate-500 mb-1">Mật khẩu phải có:</p>
                   <div className="grid grid-cols-2 gap-2">
                      <CriteriaItem valid={passwordCriteria.length} text="Tối thiểu 8 ký tự" />
                      <CriteriaItem valid={passwordCriteria.hasNumber} text="Ít nhất 1 số" />
                      <CriteriaItem valid={passwordCriteria.hasLower} text="Chữ thường" />
                      <CriteriaItem valid={passwordCriteria.hasUpper} text="Chữ hoa" />
                   </div>
                </div>
              )}

              {/* DEMO ROLE SELECTION */}
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none text-slate-600"
                >
                  <option value="owner">Chủ Shop (Toàn quyền)</option>
                  <option value="employee">Nhân Viên (Quản lý đơn)</option>
                  <option value="collaborator">Cộng Tác Viên (Giới hạn shop)</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">Demo Role</span>
              </div>

              {view === 'login' && (
                <div className="text-right">
                  <button 
                    type="button"
                    onClick={() => { setView('forgot'); setForgotStep('email'); setError(null); }}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading || (view === 'register' && !isPasswordValid)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-6 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>Đang xử lý...</span>
                ) : (
                  <>
                    {view === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản mới'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Social Login Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Hoặc tiếp tục với</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleSocialLogin('Google')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <GoogleIcon />
                <span className="text-sm font-medium text-slate-700">Google</span>
              </button>
              <button 
                onClick={() => handleSocialLogin('Apple')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <AppleIcon />
                <span className="text-sm font-medium">Apple</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
