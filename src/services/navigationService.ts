import { supabase } from '@/integrations/supabase/client';

export interface NavigationSetting {
  id: string;
  nav_key: string;
  label: string;
  is_visible: boolean;
  display_order: number;
  updated_by?: string;
  updated_at?: string;
  created_at?: string;
}

class NavigationService {
  private static instance: NavigationService;

  private constructor() {}

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  async getNavigationSettings(): Promise<NavigationSetting[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('navigation_settings')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching navigation settings:', error);
      return [];
    }
  }

  async updateNavigationVisibility(navKey: string, isVisible: boolean): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await (supabase as any)
        .from('navigation_settings')
        .update({ 
          is_visible: isVisible,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('nav_key', navKey);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating navigation visibility:', error);
      return false;
    }
  }

  async updateNavigationOrder(settings: { nav_key: string; display_order: number }[]): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updates = settings.map(setting => 
        (supabase as any)
          .from('navigation_settings')
          .update({ 
            display_order: setting.display_order,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('nav_key', setting.nav_key)
      );

      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error('Error updating navigation order:', error);
      return false;
    }
  }
}

export const navigationService = NavigationService.getInstance();
