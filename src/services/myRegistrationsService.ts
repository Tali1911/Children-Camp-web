import { supabase } from '@/integrations/supabase/client';

export interface MyRegistrationRow {
  id: string;
  registration_number: string;
  camp_type: string;
  parent_name: string;
  email: string;
  phone: string;
  children: any[];
  total_amount: number;
  payment_status: 'unpaid' | 'paid' | 'partial' | string;
  payment_method: string | null;
  payment_reference: string | null;
  registration_type: string;
  status: string | null;
  created_at: string | null;
}

export const myRegistrationsService = {
  /**
   * Fetch all camp registrations for the signed-in user, matched by email.
   * RLS ensures only rows where email = auth.jwt()->>email are returned.
   */
  async listByEmail(email: string): Promise<MyRegistrationRow[]> {
    if (!email) return [];
    const { data, error } = await supabase
      .from('camp_registrations')
      .select(
        'id, registration_number, camp_type, parent_name, email, phone, children, total_amount, payment_status, payment_method, payment_reference, registration_type, status, created_at'
      )
      .ilike('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my registrations:', error);
      return [];
    }
    return (data || []) as unknown as MyRegistrationRow[];
  },
};
