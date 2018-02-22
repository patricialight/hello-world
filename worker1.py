#import pdb; pdb.set_trace()
from gearman import GearmanWorker

def message_recieved(gearman_worker, gearman_job):
    return "Message Recieved"

worker = GearmanWorker(["localhost:4730"])
worker.register_task('letsdosomething', message_recieved)
#print(dir(worker))
worker.work()