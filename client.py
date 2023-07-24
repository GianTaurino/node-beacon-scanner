import socket
import json
from FileModificationHandler import FileModified

TCP_IP = '169.254.222.189' # server IP
TCP_PORT = 5005
BUFFER_SIZE = 1024

print ("Socket TCP enabled")

def file_modified():
	with open('/home/pi/BeaconScanner/last_detection.json', 'r') as f:
		detection = json.load(f)

	MESSAGE = json.dumps(detection)
	MSG_BYTES = MESSAGE.encode()

	s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

	try:
		s.connect((TCP_IP, TCP_PORT))
	except socket.gaierror as e:
		print ("\nAddress-related error connecting to server: %s" % e)
		return
	except socket.error as e:
		print ("\nSocket error: %s" % e)
		return

	s.sendall(MSG_BYTES)
	data = s.recv(BUFFER_SIZE)
	s.close()

	#print ("\n-------------------")
	#print ("Received data:")
	#jdata = json.loads(data)
	#print ("uuid: ", jdata["uuid"])
	#print ("date: ", jdata["date-time"])
	print ("Data sent to Communication Manager")

fileModifiedHandler = FileModified(r"last_detection.json",file_modified)
try:
	fileModifiedHandler.start()
except KeyboardInterrupt:
	print ("\nKeyboard interrupt")
	exit()
