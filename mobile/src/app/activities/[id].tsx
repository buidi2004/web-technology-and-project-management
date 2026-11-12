import { useLocalSearchParams } from 'expo-router';
import { ActivityDetailScreen } from '../../features/activities/ActivityDetailScreen';
import { LoadingScreen } from '../../components/LoadingScreen';

export default function ActivityDetailRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const raw = Array.isArray(params.id) ? params.id[0] : params.id;
  const activityId = Number(raw);

  if (!raw || !Number.isInteger(activityId) || activityId <= 0) {
    return <LoadingScreen label="Hoạt động không hợp lệ" />;
  }

  return <ActivityDetailScreen activityId={activityId} />;
}
