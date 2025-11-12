import React, { createContext, useContext, useState } from 'react';

export type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Auth
    'auth.login': 'Entrar',
    'auth.register': 'Registar',
    'auth.username': 'Nome de utilizador',
    'auth.password': 'Palavra-passe',
    'auth.confirmPassword': 'Confirmar palavra-passe',
    'auth.noAccount': 'Não tem conta?',
    'auth.hasAccount': 'Já tem conta?',
    'auth.loginButton': 'Entrar',
    'auth.registerButton': 'Criar conta',
    
    // Dashboard
    'dashboard.title': 'Os Meus Jogos',
    'dashboard.subtitle': 'Gere e organiza as tuas saves de jogos num só lugar',
    'dashboard.addGame': 'Adicionar Jogo',
    'dashboard.logout': 'Sair',
    'dashboard.noGames': 'Nenhum jogo adicionado ainda',
    'dashboard.noGamesDesc': 'Comece por adicionar o seu primeiro jogo!',
    'dashboard.sortBy': 'Ordenar por',
    'dashboard.sortName': 'Nome',
    'dashboard.sortDate': 'Data',
    'dashboard.sortAsc': 'Ascendente',
    'dashboard.sortDesc': 'Descendente',
    
    // Game
    'game.name': 'Nome do jogo',
    'game.cover': 'Imagem da capa',
    'game.saves': 'Saves',
    'game.addSave': 'Adicionar Save',
    'game.edit': 'Editar',
    'game.delete': 'Remover',
    'game.viewSaves': 'Ver Saves',
    
    // Save
    'save.name': 'Nome do save',
    'save.file': 'Ficheiro do save',
    'save.description': 'Descrição (opcional)',
    'save.uploadedOn': 'Enviado em',
    
    // Actions
    'actions.save': 'Guardar',
    'actions.cancel': 'Cancelar',
    'actions.confirm': 'Confirmar',
    'actions.close': 'Fechar',
    
    // Modals
    'modal.addGame': 'Adicionar Novo Jogo',
    'modal.editGame': 'Editar Jogo',
    'modal.deleteGame': 'Tem certeza que deseja remover este jogo?',
    'modal.addSaveToGame': 'Adicionar Save',
    'modal.editSave': 'Editar Save',
    'modal.deleteSave': 'Tem certeza que deseja remover este save?',
  },
  en: {
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm password',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.loginButton': 'Sign in',
    'auth.registerButton': 'Create account',
    
    // Dashboard
    'dashboard.title': 'My Games',
    'dashboard.subtitle': 'Manage and organize your game saves in one place',
    'dashboard.addGame': 'Add Game',
    'dashboard.logout': 'Logout',
    'dashboard.noGames': 'No games added yet',
    'dashboard.noGamesDesc': 'Start by adding your first game!',
    'dashboard.sortBy': 'Sort by',
    'dashboard.sortName': 'Name',
    'dashboard.sortDate': 'Date',
    'dashboard.sortAsc': 'Ascending',
    'dashboard.sortDesc': 'Descending',
    
    // Game
    'game.name': 'Game name',
    'game.cover': 'Cover image',
    'game.saves': 'Saves',
    'game.addSave': 'Add Save',
    'game.edit': 'Edit',
    'game.delete': 'Delete',
    'game.viewSaves': 'View Saves',
    
    // Save
    'save.name': 'Save name',
    'save.file': 'Save file',
    'save.description': 'Description (optional)',
    'save.uploadedOn': 'Uploaded on',
    
    // Actions
    'actions.save': 'Save',
    'actions.cancel': 'Cancel',
    'actions.confirm': 'Confirm',
    'actions.close': 'Close',
    
    // Modals
    'modal.addGame': 'Add New Game',
    'modal.editGame': 'Edit Game',
    'modal.deleteGame': 'Are you sure you want to delete this game?',
    'modal.addSaveToGame': 'Add Save',
    'modal.editSave': 'Edit Save',
    'modal.deleteSave': 'Are you sure you want to delete this save?',
  },
  es: {
    // Auth
    'auth.login': 'Iniciar sesión',
    'auth.register': 'Registrarse',
    'auth.username': 'Nombre de usuario',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar contraseña',
    'auth.noAccount': '¿No tienes cuenta?',
    'auth.hasAccount': '¿Ya tienes cuenta?',
    'auth.loginButton': 'Entrar',
    'auth.registerButton': 'Crear cuenta',
    
    // Dashboard
    'dashboard.title': 'Mis Juegos',
    'dashboard.subtitle': 'Gestiona y organiza tus guardados de juegos en un solo lugar',
    'dashboard.addGame': 'Añadir Juego',
    'dashboard.logout': 'Cerrar sesión',
    'dashboard.noGames': 'No hay juegos añadidos todavía',
    'dashboard.noGamesDesc': '¡Empieza añadiendo tu primer juego!',
    'dashboard.sortBy': 'Ordenar por',
    'dashboard.sortName': 'Nombre',
    'dashboard.sortDate': 'Fecha',
    'dashboard.sortAsc': 'Ascendente',
    'dashboard.sortDesc': 'Descendente',
    
    // Game
    'game.name': 'Nombre del juego',
    'game.cover': 'Imagen de portada',
    'game.saves': 'Guardados',
    'game.addSave': 'Añadir Guardado',
    'game.edit': 'Editar',
    'game.delete': 'Eliminar',
    'game.viewSaves': 'Ver Guardados',
    
    // Save
    'save.name': 'Nombre del guardado',
    'save.file': 'Archivo del guardado',
    'save.description': 'Descripción (opcional)',
    'save.uploadedOn': 'Subido el',
    
    // Actions
    'actions.save': 'Guardar',
    'actions.cancel': 'Cancelar',
    'actions.confirm': 'Confirmar',
    'actions.close': 'Cerrar',
    
    // Modals
    'modal.addGame': 'Añadir Nuevo Juego',
    'modal.editGame': 'Editar Juego',
    'modal.deleteGame': '¿Estás seguro de que quieres eliminar este juego?',
    'modal.addSaveToGame': 'Añadir Guardado',
    'modal.editSave': 'Editar Guardado',
    'modal.deleteSave': '¿Estás seguro de que quieres eliminar este guardado?',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
