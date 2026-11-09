import { useState, useEffect } from "react";
import { profile } from "@/data/profile";

export interface EditableProject {
  title: string;
  subtitle: string;
  year: string;
  slug: string;
  category: string;
  technologies: string[];
  githubUrl: string;
  description: string;
  details: string;
  highlights: string[];
  featured: boolean;
}

export interface EditableExperience {
  role: string;
  organization: string;
  date: string;
  location: string;
  description: string;
  status: string;
}

export interface EditableSiteData {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  about: {
    summary: string;
  };
  contact: {
    email: string;
    location: string;
    linkedin: string;
    github: string;
  };
  skills: {
    languages: string[];
    aiMl: string[];
    fullStack: string[];
    dataCloud: string[];
  };
  projects: EditableProject[];
  experience: EditableExperience[];
}

const STORAGE_KEY = "ayushdevx_site_content_v1";

export function getDefaultSiteData(): EditableSiteData {
  return {
    hero: {
      eyebrow: profile.hero.eyebrow,
      title: profile.hero.title,
      description: profile.hero.description,
    },
    about: {
      summary: profile.about.summary,
    },
    contact: {
      email: profile.contact.email,
      location: profile.contact.location,
      linkedin: profile.contact.linkedin,
      github: profile.contact.github,
    },
    skills: {
      languages: [...profile.skills.languages],
      aiMl: [...profile.skills.aiMl],
      fullStack: [...profile.skills.fullStack],
      dataCloud: [...profile.skills.dataCloud],
    },
    projects: profile.projects.map((p) => ({
      title: p.title,
      subtitle: p.subtitle,
      year: p.year,
      slug: p.slug,
      category: p.category,
      technologies: [...p.technologies],
      githubUrl: p.githubUrl,
      description: p.description,
      details: p.details,
      highlights: [...p.highlights],
      featured: p.featured,
    })),
    experience: profile.experience.map((e) => ({
      role: e.role,
      organization: e.organization,
      date: e.date,
      location: e.location,
      description: e.description,
      status: e.status,
    })),
  };
}

export function useSiteData() {
  const [data, setData] = useState<EditableSiteData>(() => {
    if (typeof window === "undefined") return getDefaultSiteData();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.hero) return parsed;
      }
    } catch (e) {
      console.error("Failed to load site data from localStorage", e);
    }
    return getDefaultSiteData();
  });

  const saveSiteData = (newData: EditableSiteData) => {
    setData(newData);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      } catch (e) {
        console.error("Failed to save site data to localStorage", e);
      }
    }
  };

  const updateHero = (hero: EditableSiteData["hero"]) => {
    saveSiteData({ ...data, hero });
  };

  const updateAbout = (about: EditableSiteData["about"]) => {
    saveSiteData({ ...data, about });
  };

  const updateContact = (contact: EditableSiteData["contact"]) => {
    saveSiteData({ ...data, contact });
  };

  const updateSkills = (skills: EditableSiteData["skills"]) => {
    saveSiteData({ ...data, skills });
  };

  const addProject = (project: EditableProject) => {
    saveSiteData({ ...data, projects: [project, ...data.projects] });
  };

  const updateProject = (index: number, project: EditableProject) => {
    const updated = [...data.projects];
    updated[index] = project;
    saveSiteData({ ...data, projects: updated });
  };

  const deleteProject = (index: number) => {
    const updated = data.projects.filter((_, i) => i !== index);
    saveSiteData({ ...data, projects: updated });
  };

  const addExperience = (exp: EditableExperience) => {
    saveSiteData({ ...data, experience: [exp, ...data.experience] });
  };

  const updateExperience = (index: number, exp: EditableExperience) => {
    const updated = [...data.experience];
    updated[index] = exp;
    saveSiteData({ ...data, experience: updated });
  };

  const deleteExperience = (index: number) => {
    const updated = data.experience.filter((_, i) => i !== index);
    saveSiteData({ ...data, experience: updated });
  };

  const resetAllSiteData = () => {
    saveSiteData(getDefaultSiteData());
  };

  return {
    data,
    updateHero,
    updateAbout,
    updateContact,
    updateSkills,
    addProject,
    updateProject,
    deleteProject,
    addExperience,
    updateExperience,
    deleteExperience,
    resetAllSiteData,
  };
}

